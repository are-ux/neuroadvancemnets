import type { ReactNode } from "react";

/** Small label that leads a section: an orange marker and a caption. */
export function SectionLabel({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p className={`flex items-center gap-2 caption-1 ${tone === "dark" ? "text-ice" : "text-slate"}`}>
      <span aria-hidden="true" className="size-2 rounded-full bg-orange" />
      {children}
    </p>
  );
}
