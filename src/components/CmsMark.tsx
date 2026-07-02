import { createElement, type ElementType, type ReactNode } from "react";

/**
 * Marks a block on the public site as CMS-editable.
 * In normal viewing it's a transparent wrapper.
 * When the page is loaded inside the /admin/editor iframe (?cms=1),
 * CmsOverlay turns these into clickable hotspots that open the right editor.
 */
export function CmsMark({
  kind,
  target,
  label,
  as = "div",
  className,
  children,
}: {
  kind: "section" | "collection";
  target: string;
  label: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return createElement(
    as,
    {
      className,
      "data-cms-kind": kind,
      "data-cms-target": target,
      "data-cms-label": label,
    },
    children,
  );
}

/**
 * Marks an individual field within a section so clicking it in the editor
 * jumps directly to that field in the side panel.
 *
 * Usage:
 *   <CmsField section="hero" field="headline" as="h1" className="...">
 *     {text}
 *   </CmsField>
 */
export function CmsField({
  section,
  field,
  as = "span",
  className,
  style,
  children,
}: {
  section: string;
  field: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return createElement(
    as,
    {
      className,
      style,
      "data-cms-kind": "field",
      "data-cms-target": section,
      "data-cms-field": field,
      "data-cms-label": `${field}`,
    },
    children,
  );
}

/**
 * Marks a collection item so clicking it in the editor opens that specific
 * item's edit form in the side panel.
 *
 * Usage:
 *   <CmsItem collection="services" itemId={item.id} as="div" className="...">
 *     {card content}
 *   </CmsItem>
 */
export function CmsItem({
  collection,
  itemId,
  label,
  as = "div",
  className,
  style,
  children,
}: {
  collection: string;
  itemId: string;
  label?: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return createElement(
    as,
    {
      className,
      style,
      "data-cms-kind": "item",
      "data-cms-target": collection,
      "data-cms-item": itemId,
      "data-cms-label": label ?? collection,
    },
    children,
  );
}
