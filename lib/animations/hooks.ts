"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reads a QA switch from the address bar, for example ?motion=reduce or ?webgl=off.
 * Switches work in development, and in a production build only when
 * NEXT_PUBLIC_QA_SWITCHES is "true". The public site should leave that unset.
 */
const QA_ENABLED = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_QA_SWITCHES === "true";
export function qaSwitch(name: string, value: string): boolean {
  return QA_ENABLED && typeof window !== "undefined" && new URLSearchParams(window.location.search).get(name) === value;
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the visitor asked the system for reduced motion. False on the server. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(QUERY).matches || qaSwitch("motion", "reduce"),
    () => false,
  );
}

/**
 * Reports when an element enters the viewport. With once set, it stops
 * observing after the first entry so reveals never replay.
 */
export function useInView<T extends Element>(
  options: { once?: boolean; rootMargin?: string; threshold?: number } = {},
): [RefObject<T | null>, boolean] {
  const { once = true, rootMargin = "0px 0px -12% 0px", threshold = 0 } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, inView];
}
