"use client";

import { useEffect, useRef, useState } from "react";
import { BOOKING_ANCHOR } from "@/lib/content/booking";
import { CalendarSkeleton, CalendlyEmbed } from "./calendly-embed";

/**
 * Holds the Calendly calendar back until it is about to be needed.
 *
 * The booking section is at the bottom of the homepage, so Calendly's script has no
 * business loading during the hero. The calendar is started by whichever comes first:
 *
 *   the page was opened on, or navigates to, the booking address
 *   the section comes within a couple of screens of the viewport
 *
 * Once started it stays mounted, so an appointment in progress is never reset.
 */
export function LazyCalendly({ url, headingId }: { url: string; headingId: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const onAddress = () => {
      if (window.location.hash !== `#${BOOKING_ANCHOR}`) return;
      setArmed(true);
      // Move keyboard and screen reader focus to the section the visitor asked for,
      // without fighting the browser's own scroll to it.
      document.getElementById(headingId)?.focus({ preventScroll: true });
    };
    onAddress();
    // Arriving on the booking address from another page or a refresh: the browser's own jump to
    // the anchor can be undone while the scroll story above sets itself up, so it is repeated
    // once the page has settled. It is an instant jump, never an animated trip down the page.
    let frame = 0;
    if (window.location.hash === `#${BOOKING_ANCHOR}`) {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          document.getElementById(BOOKING_ANCHOR)?.scrollIntoView({ behavior: "instant", block: "start" });
        });
      });
    }
    window.addEventListener("hashchange", onAddress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onAddress);
    };
  }, [headingId]);

  useEffect(() => {
    const el = host.current;
    if (!el || armed) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setArmed(true), { rootMargin: "1600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [armed]);

  return (
    <div ref={host}>
      {armed ? (
        <CalendlyEmbed url={url} />
      ) : (
        <div className="relative min-h-[560px]">
          <CalendarSkeleton />
        </div>
      )}
    </div>
  );
}
