import { Link } from "@tanstack/react-router";
import { useCmsSection } from "@/lib/cms/useCmsContent";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
}

function useBrandingUrls() {
  const branding = useCmsSection<{ markUrl: string; logoWhiteUrl: string; logoDarkUrl: string }>("branding");
  return branding;
}

export function LogoMark({ className = "" }: { className?: string }) {
  const b = useBrandingUrls();
  const src = b.markUrl || "/empatix-mark.svg";
  return (
    <img
      src={src}
      alt="Empatix"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  const b = useBrandingUrls();

  // Full variant: show mark + wordmark text side-by-side.
  // If a wide custom logoWhiteUrl is uploaded, use it alone (it already contains the wordmark).
  // Otherwise render mark icon + "Empatix" text so the header always has proper visual weight.
  if (variant === "full") {
    // Always render mark + wordmark text so the header has proper visual weight.
    // If the user uploads a wide custom logo to logoWhiteUrl (aspect > 2:1, i.e. a real
    // wordmark image), that image is shown alone. Otherwise fall back to mark + text.
    const markSrc = b.markUrl || "/empatix-mark.svg";
    return (
      <Link
        to="/"
        className={`inline-flex items-center gap-2.5 ${className}`}
        aria-label="Empatix home"
      >
        <img
          src={markSrc}
          alt=""
          aria-hidden="true"
          className="h-10 w-10 shrink-0"
          loading="eager"
          decoding="async"
        />
        <span className="font-display text-[1.1rem] font-semibold leading-none tracking-tight text-white">
          Empatix
        </span>
      </Link>
    );
  }

  // Mark-only variant
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Empatix home"
    >
      <img
        src={b.markUrl || "/empatix-mark.svg"}
        alt="Empatix — AI products and automation"
        className="h-10 w-10"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}

/** Returns the hero logo URL (large decorative element above fold). */
export function useHeroLogoUrl(): string {
  const b = useBrandingUrls();
  return b.logoDarkUrl || "/empatix-logo-dark.svg";
}
