import type { ReactNode } from "react";

/** Small label that leads a section: an orange marker and a caption. */
export function SectionLabel({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p className={`flex items-center gap-2 caption-1 ${tone === "dark" ? "text-ice" : "text-slate"}`}>
      <span aria-hidden="true" className={`h-px w-6 ${tone === "dark" ? "bg-white/40" : "bg-navy/40"}`} />
      {children}
    </p>
  );
}
