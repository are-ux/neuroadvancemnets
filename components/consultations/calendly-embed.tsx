"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { buttonClass } from "@/components/ui/button";

const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
/** If the calendar has not reported in by then, the page offers the direct link instead. */
const TIMEOUT_MS = 15000;

type CalendlyApi = {
  initInlineWidget: (options: { url: string; parentElement: HTMLElement; resize?: boolean }) => void;
};
declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

/**
 * Loads Calendly's official embed script once per page, however many times it is asked.
 * A failed load clears itself so a retry can try again.
 */
let scriptLoad: Promise<void> | null = null;
function loadCalendlyScript(): Promise<void> {
  if (window.Calendly) return Promise.resolve();
  if (scriptLoad) return scriptLoad;
  scriptLoad = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => {
        scriptLoad = null;
        script.remove();
        reject(new Error("The Calendly script could not be loaded."));
      },
      { once: true },
    );
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return scriptLoad;
}

type Status = "loading" | "ready" | "error";

/** Calendar shaped placeholder, shown before Calendly is started and while it loads. */
export function CalendarSkeleton() {
  return (
    <div role="status" className="absolute inset-0 z-10 flex flex-col gap-4 rounded-2xl bg-white p-6">
      <span className="sr-only">Loading the booking calendar</span>
      <div className="skeleton h-6 w-40 rounded-lg bg-ice" />
      <div className="skeleton h-4 w-64 max-w-full rounded-lg bg-ice" />
      <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-7 gap-2">
        {Array.from({ length: 28 }, (_, i) => (
          <div key={i} className="skeleton aspect-square rounded-lg bg-ice" />
        ))}
      </div>
    </div>
  );
}

/**
 * Inline Calendly calendar, using Calendly's own initializer.
 *
 * It is initialised once per mount, asks Calendly to size the frame to its content
 * (so no fixed height can cut off the scheduling controls), and falls back to a
 * direct link if the third party script or calendar does not arrive.
 * Time zones, availability, and the booking itself are handled entirely by Calendly.
 */
export function CalendlyEmbed({ url }: { url: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    setStatus("loading");

    // Calendly's frame announces itself with postMessage once the event page is showing.
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://calendly.com") return;
      const name = (event.data as { event?: unknown } | null)?.event;
      if (typeof name === "string" && name.startsWith("calendly.")) setStatus("ready");
    };
    window.addEventListener("message", onMessage);

    const timeout = window.setTimeout(() => {
      if (!cancelled) setStatus((current) => (current === "loading" ? "error" : current));
    }, TIMEOUT_MS);

    loadCalendlyScript()
      .then(() => {
        // Skipped when this effect was cleaned up first, which is what stops a double initialisation.
        if (cancelled || !window.Calendly) return;
        el.replaceChildren();
        window.Calendly.initInlineWidget({ url, parentElement: el, resize: true });
        const frame = el.querySelector("iframe");
        frame?.setAttribute("title", "Calendly scheduling calendar");
        // The frame's own load event fires before the calendar has drawn, so it only counts as a
        // late fallback in case Calendly's message never arrives.
        frame?.addEventListener("load", () => window.setTimeout(() => !cancelled && setStatus("ready"), 2500), { once: true });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      el.replaceChildren();
    };
  }, [url, attempt]);

  return (
    <div className="relative">
      {status === "loading" && <CalendarSkeleton />}

      {status === "error" && (
        <div role="alert" className="flex flex-col items-start gap-4 rounded-2xl bg-white p-6">
          <p className="title-2 text-navy">The booking calendar could not be loaded.</p>
          <p className="body-3 text-slate">
            This can happen when a content blocker or network filter stops Calendly. You can try again, or open the
            same calendar directly on Calendly.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className={buttonClass("outline-light", "md")}>
              Try again
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "md")}>
              Open on Calendly
              <ArrowSquareOut aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>
      )}

      {/* Calendly fills this element and sets its height to fit the calendar. The minimum covers the moment before it does. */}
      <div
        ref={host}
        aria-busy={status === "loading"}
        className={`min-w-0 overflow-hidden rounded-2xl [&>iframe]:block [&>iframe]:min-h-[560px] [&>iframe]:w-full ${status === "error" ? "hidden" : ""}`}
        style={{ minWidth: 0, minHeight: 560 }}
      />
    </div>
  );
}
