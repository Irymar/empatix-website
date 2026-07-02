import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetSection, adminUpsertSection } from "@/lib/admin/content.functions";
import { adminUploadMedia } from "@/lib/admin/media.functions";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/branding")({
  ssr: false,
  component: BrandingPage,
});

const SLOTS = [
  {
    key: "markUrl" as const,
    label: "Icon mark",
    help: "Small square icon (favicon area, mobile header). SVG or PNG, displays at 36×36 px.",
    fallback: "/empatix-mark.svg",
  },
  {
    key: "logoWhiteUrl" as const,
    label: "Full logo — header",
    help: "Horizontal logo used in the top navigation bar. SVG or transparent PNG, displays at 36 px tall.",
    fallback: "/empatix-logo-white.svg",
  },
  {
    key: "logoDarkUrl" as const,
    label: "Full logo — hero",
    help: "Large decorative mark used as the hero gradient shape on the homepage.",
    fallback: "/empatix-logo-dark.svg",
  },
] as const;

type BrandingData = { markUrl: string; logoWhiteUrl: string; logoDarkUrl: string };

function BrandingPage() {
  const qc = useQueryClient();
  const getSectionFn = useServerFn(adminGetSection);
  const upsertSectionFn = useServerFn(adminUpsertSection);
  const uploadFn = useServerFn(adminUploadMedia);

  const { data: row, isLoading } = useQuery({
    queryKey: ["admin", "section", "branding"],
    queryFn: () => getSectionFn({ data: { key: "branding" } }),
  });

  const current: BrandingData = {
    markUrl: "",
    logoWhiteUrl: "",
    logoDarkUrl: "",
    ...((row?.data as Partial<BrandingData>) ?? {}),
  };

  const save = useMutation({
    mutationFn: (data: BrandingData) =>
      upsertSectionFn({ data: { key: "branding", data: data as Record<string, unknown> } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "section", "branding"] });
      qc.invalidateQueries({ queryKey: ["cms", "section", "branding"] });
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Branding / Logo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your logo files here. They replace the built-in SVGs site-wide instantly after saving.
          Leave a slot blank to keep the default.
        </p>
      </div>

      <div className="space-y-6">
        {SLOTS.map((slot) => (
          <LogoSlot
            key={slot.key}
            slot={slot}
            currentUrl={current[slot.key]}
            uploadFn={uploadFn}
            onSave={async (url) => {
              const updated = { ...current, [slot.key]: url };
              await save.mutateAsync(updated);
            }}
            onClear={async () => {
              const updated = { ...current, [slot.key]: "" };
              await save.mutateAsync(updated);
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface SlotDef {
  key: "markUrl" | "logoWhiteUrl" | "logoDarkUrl";
  label: string;
  help: string;
  fallback: string;
}

function LogoSlot({
  slot,
  currentUrl,
  uploadFn,
  onSave,
  onClear,
}: {
  slot: SlotDef;
  currentUrl: string;
  uploadFn: ReturnType<typeof useServerFn<typeof adminUploadMedia>>;
  onSave: (url: string) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displaySrc = currentUrl || slot.fallback;
  const isCustom = !!currentUrl;

  async function handleFile(file: File) {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { setError("File too large (max 15 MB)"); return; }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", `Empatix ${slot.label}`);
      const result = await uploadFn({ data: fd });
      const url: string = (result as { public_url: string }).public_url;
      setSaving(true);
      await onSave(url);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div>
        <p className="font-medium text-sm">{slot.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{slot.help}</p>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-32 items-center justify-center rounded-md border border-dashed border-border bg-background overflow-hidden p-2">
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={slot.label}
              className="max-h-full max-w-full object-contain"
              style={{ background: isCustom ? undefined : "#1a1a2e" }}
            />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          {isCustom ? (
            <p className="text-green-500 font-medium">Custom logo active</p>
          ) : (
            <p>Using built-in default</p>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={uploading || saving}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4 mr-1.5" />
          {uploading ? "Uploading…" : saving ? "Saving…" : "Upload new logo"}
        </Button>
        {isCustom && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={saving}
            onClick={onClear}
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset to default
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
