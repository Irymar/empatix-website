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
  const src =
    variant === "full"
      ? b.logoWhiteUrl || "/empatix-logo-white.svg"
      : b.markUrl || "/empatix-mark.svg";
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Empatix home"
    >
      <img
        src={src}
        alt="Empatix — AI products and automation"
        className={variant === "full" ? "h-9 w-auto" : "h-9 w-9"}
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
