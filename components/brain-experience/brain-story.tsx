"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Hero } from "@/components/hero/hero";
import { Reveal } from "@/components/ui/reveal";
import { brainChapters, modelCredit } from "@/lib/content/brain-chapters";
import { useInView, useReducedMotion } from "@/lib/animations/hooks";
import { TONE_BAND_MARGIN } from "@/lib/design-tokens";
import { positionFromScroll } from "@/lib/animations/story-timeline";
import { BrainStage } from "./brain-stage";

const stopLabels = ["Introduction", ...brainChapters.map((c) => c.label)];
const stopIds = ["home", ...brainChapters.map((c) => c.id)];

/**
 * Hero plus the scroll driven anatomy chapters.
 *
 * Layout: one sticky stage holds the single persistent canvas for the whole
 * section, and the copy scrolls past in normal document flow. Nothing is
 * pinned with JavaScript, so text never jitters and the page stays readable
 * if the canvas fails.
 *
 * Motion: the canvas asks for the story position once per rendered frame.
 * The position is derived from window.scrollY and cached section centres,
 * so there is no scroll listener at all.
 */
export function BrainStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const centres = useRef<number[]>([]);
  const [inView, setInView] = useState(true);
  const [activeStop, setActiveStop] = useState(0);
  const activeRef = useRef(0);
  const heroFade = useRef(1);
  const reducedMotion = useReducedMotion();
  // The story dims from paper to night when this zone reaches the navigation, which watches the same zone.
  const [zoneRef, dark] = useInView<HTMLDivElement>({ once: false, rootMargin: TONE_BAND_MARGIN });

  const getPosition = useCallback(() => {
    const position = positionFromScroll(window.scrollY + window.innerHeight / 2, centres.current);
    // The cover copy clears the stage before the brain travels across it. Written only when it changes.
    const fade = Math.round(Math.min(1, Math.max(0, 1 - (position - 0.04) / 0.22)) * 50) / 50;
    const hero = stopRefs.current[0];
    if (hero && fade !== heroFade.current) {
      heroFade.current = fade;
      hero.style.opacity = String(fade);
      hero.style.pointerEvents = fade < 0.1 ? "none" : "";
    }
    const nearest = Math.round(position);
    if (nearest !== activeRef.current) {
      activeRef.current = nearest;
      setActiveStop(nearest); // one render per chapter change, never per frame
    }
    return position;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      centres.current = stopRefs.current.map((el) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY + rect.height / 2;
      });
      getPosition();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(section);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [getPosition]);

  return (
    <section ref={sectionRef} id="home" data-tone={dark ? "dark" : "light"} className="story relative">
      <div ref={zoneRef} data-nav-tone="dark" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[92svh]" />
      {/* Copy layer, in normal flow. */}
      <div className="relative">
        <Hero
          ref={(el) => {
            stopRefs.current[0] = el;
          }}
        />

        <div id="inside-the-brain" aria-label="Inside the human brain" role="group">
          <h2 className="sr-only">Inside the human brain</h2>
          {brainChapters.map((chapter, i) => (
            <article
              key={chapter.id}
              id={chapter.id}
              ref={(el) => {
                stopRefs.current[i + 1] = el;
              }}
              className="flex min-h-[80svh] scroll-mt-0 items-end last:min-h-svh lg:min-h-svh lg:items-center"
            >
              <div className="shell pb-10 lg:pb-0">
                <Reveal className="flex max-w-md flex-col items-start gap-4">
                  <p className="flex items-center gap-3 caption-1 story-body">
                    <span className="tabular-nums story-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden="true" className="story-rule h-px w-8" />
                    {chapter.label}
                  </p>
                  <h3 className="heading-4 story-ink lg:heading-3">{chapter.heading}</h3>
                  <p className="body-3 story-body lg:title-2">{chapter.description}</p>
                  {chapter.location && <p className="caption-2 story-faint">{chapter.location}</p>}
                  {i === brainChapters.length - 1 && <p className="caption-5 story-faint">{modelCredit}</p>}
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/*
        Stage layer. It sits above the copy but ignores the pointer. On narrow
        screens its top band is opaque, so copy slides under the brain instead
        of across it and the model is never hidden mid rotation.
      */}
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-lvh overflow-hidden">
          <div className="story-bg absolute inset-x-0 top-0 h-[46%] lg:hidden" />
          <BrainStage getPosition={getPosition} active={inView} reducedMotion={reducedMotion} />

          <nav
            aria-label="Brain chapters"
            className="pointer-events-auto absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block"
          >
            <ol className="flex flex-col items-end gap-3">
              {stopLabels.map((label, i) => {
                const current = i === activeStop;
                return (
                  <li key={label}>
                    <a
                      href={`#${stopIds[i]}`}
                      aria-current={current ? "step" : undefined}
                      className="group flex items-center gap-3 rounded-lg px-2 py-1"
                    >
                      <span
                        className={`caption-4 transition-opacity motion-hover ${
                          current ? "story-ink opacity-100" : "story-body opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                        }`}
                      >
                        {label}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full transition-[background-color,transform] motion-settle ${
                          current ? "story-ink scale-150 bg-current" : "story-rule"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
