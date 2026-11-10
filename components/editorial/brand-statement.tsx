"use client";

import { useInView } from "@/lib/animations/hooks";

const words = ["Discover", "Understand", "Advance"];

/** One word of the tagline. It brightens once, when it crosses a line 40% up from the bottom of the viewport. */
function Word({ children }: { children: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ rootMargin: "0px 0px -40% 0px" });
  return (
    <span ref={ref} className={`tagline-word block ${inView ? "is-in" : ""}`}>
      {children}
      <span className="text-orange">.</span>
    </span>
  );
}

/**
 * Tagline reveal: large type, muted at rest, each word activating on its own as
 * the visitor scrolls. Uses one IntersectionObserver per word, no scroll listener.
 */
export function BrandStatement() {
  return (
    <section aria-label="Our purpose" className="flex min-h-[80svh] items-center py-24">
      <div className="shell">
        <p className="mx-auto max-w-[680px] heading-2 text-navy md:heading-1">
          {words.map((word) => (
            <Word key={word}>{word}</Word>
          ))}
        </p>
      </div>
    </section>
  );
}
