"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/lib/animations/hooks";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Milliseconds, for staggering siblings. */
  delay?: number;
};

/** Rises 32px and fades in once, the first time it enters the viewport. */
export function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: Props) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
