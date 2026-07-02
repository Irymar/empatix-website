import { useEffect } from "react";
import { cmsPreviewStore } from "@/lib/cms/previewStore";

/**
 * Mounted globally in __root. Activates only when the page is loaded inside
 * the admin editor iframe (URL has ?cms=1). Adds hover outlines and a floating
 * "Edit" chip on every [data-cms-kind] element and forwards clicks to the
 * parent admin window so it can open the right editor panel.
 *
 * Supports four kinds:
 *  - "section"    → open section editor (all fields)
 *  - "collection" → open collection list editor
 *  - "field"      → open section editor focused on a specific field
 *  - "item"       → open collection editor focused on a specific item id
 */
export function CmsOverlay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cms") !== "1") return;
    if (window.parent === window) return;

    const styleEl = document.createElement("style");
    styleEl.textContent = `
      [data-cms-kind] {
        position: relative;
        outline-offset: 2px;
        cursor: pointer;
        transition: outline 0.1s;
      }
      [data-cms-kind]:hover {
        outline: 2px solid hsl(217 91% 60% / .85);
        border-radius: 2px;
      }
      /* floating chip */
      [data-cms-kind][data-cms-active]::after {
        content: attr(data-cms-chip);
        position: absolute;
        top: 0;
        left: 0;
        transform: translateY(-100%);
        background: hsl(217 91% 55%);
        color: white;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.03em;
        border-radius: 4px 4px 0 0;
        pointer-events: none;
        z-index: 9999;
        font-family: ui-sans-serif, system-ui, sans-serif;
        white-space: nowrap;
      }
      /* field marks use a tighter outline */
      [data-cms-kind="field"]:hover,
      [data-cms-kind="item"]:hover {
        outline: 2px dashed hsl(262 83% 65% / .9);
        border-radius: 2px;
      }
      [data-cms-kind="field"][data-cms-active]::after,
      [data-cms-kind="item"][data-cms-active]::after {
        background: hsl(262 83% 55%);
      }
      html[data-cms-editing] {
        overflow-x: hidden;
      }
      /* Edit button that appears on hover */
      .cms-edit-btn {
        position: fixed;
        z-index: 10000;
        background: hsl(217 91% 55%);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,.35);
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background 0.1s;
      }
      .cms-edit-btn:hover { background: hsl(217 91% 45%); }
      .cms-edit-btn.field { background: hsl(262 83% 55%); }
      .cms-edit-btn.field:hover { background: hsl(262 83% 45%); }
      .cms-edit-btn.item { background: hsl(262 83% 55%); }
      .cms-edit-btn.item:hover { background: hsl(262 83% 45%); }
    `;
    document.head.appendChild(styleEl);
    document.documentElement.setAttribute("data-cms-editing", "1");

    // Floating edit button
    const editBtn = document.createElement("button");
    editBtn.className = "cms-edit-btn";
    editBtn.textContent = "✏ Edit";
    editBtn.style.display = "none";
    document.body.appendChild(editBtn);

    let currentMark: HTMLElement | null = null;

    const findMark = (el: EventTarget | null): HTMLElement | null => {
      let node = el as HTMLElement | null;
      while (node && node !== document.body) {
        if (node.dataset?.cmsIgnore != null) return null;
        if (node.dataset?.cmsKind) return node;
        node = node.parentElement;
      }
      return null;
    };

    const kindLabel = (mark: HTMLElement): string => {
      const kind = mark.dataset.cmsKind ?? "";
      const label = mark.dataset.cmsLabel ?? mark.dataset.cmsTarget ?? "";
      if (kind === "field") return `✏ ${label}`;
      if (kind === "item") return `✏ ${label}`;
      if (kind === "collection") return `☰ ${label}`;
      return `✎ ${label}`;
    };

    const positionBtn = (mark: HTMLElement) => {
      const rect = mark.getBoundingClientRect();
      editBtn.style.left = `${Math.max(4, rect.left)}px`;
      editBtn.style.top = `${Math.max(4, rect.top - 28)}px`;
      editBtn.style.display = "flex";
      const kind = mark.dataset.cmsKind ?? "";
      editBtn.className = `cms-edit-btn${kind === "field" || kind === "item" ? ` ${kind}` : ""}`;
      editBtn.textContent = kindLabel(mark);
    };

    const sendSelect = (mark: HTMLElement) => {
      window.parent.postMessage(
        {
          source: "empatix-cms",
          type: "select",
          kind: mark.dataset.cmsKind,
          target: mark.dataset.cmsTarget,
          label: mark.dataset.cmsLabel,
          field: mark.dataset.cmsField ?? null,
          itemId: mark.dataset.cmsItem ?? null,
        },
        window.location.origin,
      );
    };

    const onOver = (e: MouseEvent) => {
      const mark = findMark(e.target);
      if (mark === currentMark) return;
      if (currentMark) currentMark.removeAttribute("data-cms-active");
      currentMark = mark;
      if (mark) {
        mark.setAttribute("data-cms-active", "1");
        mark.setAttribute("data-cms-chip", kindLabel(mark));
        positionBtn(mark);
      } else {
        editBtn.style.display = "none";
      }
    };

    const onOut = (e: MouseEvent) => {
      // Only hide if leaving to something outside the button and current mark
      const related = e.relatedTarget as HTMLElement | null;
      if (related === editBtn || editBtn.contains(related)) return;
      if (currentMark && !currentMark.contains(related)) {
        currentMark.removeAttribute("data-cms-active");
        currentMark = null;
        editBtn.style.display = "none";
      }
    };

    const onMouseLeaveBtn = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (currentMark && currentMark.contains(related)) return;
      if (currentMark) currentMark.removeAttribute("data-cms-active");
      currentMark = null;
      editBtn.style.display = "none";
    };

    editBtn.addEventListener("mouseleave", onMouseLeaveBtn);

    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentMark) sendSelect(currentMark);
    });

    const onClick = (e: MouseEvent) => {
      const mark = findMark(e.target);
      if (!mark) return;
      e.preventDefault();
      e.stopPropagation();
      sendSelect(mark);
    };

    const onScroll = () => {
      if (currentMark) positionBtn(currentMark);
    };

    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Receive live-preview updates from the admin editor
    const onPreview = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m: any = e.data;
      if (!m || m.source !== "empatix-cms-preview") return;
      if (m.type === "section") cmsPreviewStore.setSection(m.key, m.data ?? null);
      else if (m.type === "collection") cmsPreviewStore.setCollection(m.key, m.rows ?? null);
      else if (m.type === "clear-section") cmsPreviewStore.clearSection(m.key);
      else if (m.type === "clear-collection") cmsPreviewStore.clearCollection(m.key);
      else if (m.type === "clear-all") cmsPreviewStore.clearAll();
    };
    window.addEventListener("message", onPreview);

    window.parent.postMessage(
      { source: "empatix-cms", type: "ready", path: window.location.pathname },
      window.location.origin,
    );

    return () => {
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("message", onPreview);
      document.documentElement.removeAttribute("data-cms-editing");
      cmsPreviewStore.clearAll();
      styleEl.remove();
      editBtn.remove();
    };
  }, []);

  return null;
}
