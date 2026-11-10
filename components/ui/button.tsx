import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * primary        ink on paper sections
 * inverse        paper on night sections
 * outline-light  quiet secondary action on paper
 * outline-dark   quiet secondary action on night
 */
type Variant = "primary" | "inverse" | "outline-light" | "outline-dark";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform] motion-hover active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-soft hover:bg-slate",
  inverse: "bg-soft text-navy hover:bg-white",
  "outline-light": "border border-navy/20 text-navy hover:border-navy/50 hover:bg-navy/5",
  "outline-dark": "border border-white/25 text-white hover:border-white/60 hover:bg-white/10",
};

const sizes: Record<Size, string> = { md: "button-md", sm: "button-sm" };

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type LinkProps = { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode } & Omit<
  ComponentProps<typeof Link>,
  "href" | "className" | "children"
>;

export function ButtonLink({ href, variant, size, className, children, ...rest }: LinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
