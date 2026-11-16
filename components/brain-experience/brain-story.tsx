"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "@/components/hero/hero";
import {
  beatCopy,
  beats,
  lobeNames,
  modelCredit,
  railStops,
  type BeatCopy,
  type BeatId,
  type LobeId,
  type Shot,
} from "@/lib/content/brain-chapters";
import { useReducedMotion } from "@/lib/animations/hooks";
import { activeBeat, copyBeat, resolveShots, scheduleBeats, stepFor, toneColours, type BeatWindow } from "@/lib/animations/story-timeline";
import { STORY_DESKTOP_MIN } from "@/lib/design-tokens";
import { BrainStage } from "./brain-stage";

/** Scroll distance of the pinned frame, in svh: one step per beat. Kept in step with the track classes below. */
const TRACK_CLASS = "h-[262svh] lg:h-[289svh]";

const sideClass: Record<BeatCopy["side"], string> = {
  left: "lg:justify-start",
  right: "lg:justify-end",
  centre: "justify-center text-center",
};

/** One beat's copy. Every block is rendered; only the active one is visible. */
function BeatBlock({ id, copy, lobe, active }: { id: BeatId; copy: BeatCopy; lobe: LobeId | null; active: boolean }) {
  const centre = copy.side === "centre";
  const lines = typeof copy.title === "string" ? [copy.title] : copy.title;
  return (
    <article
      data-beat={id}
      className={`beat-copy absolute inset-0 flex items-end ${centre ? "" : "lg:items-center"} ${active ? "is-active" : ""}`}
    >
      <div className={`shell flex pb-8 lg:pb-0 ${sideClass[copy.side]} ${centre ? "lg:pb-16" : ""}`}>
        <div className={`flex w-full flex-col gap-3 lg:gap-4 ${centre ? "max-w-[680px] items-center" : "max-w-md lg:max-w-[30rem]"}`}>
          <p className="flex items-center gap-3 caption-1 story-body">
            <span className="tabular-nums story-faint">{String(copy.index).padStart(2, "0")}</span>
            <span aria-hidden="true" className="story-rule h-px w-8" />
            {copy.chapter}
          </p>

          {/* The pair of lobes this chapter covers, with the one in view marked. */}
          {copy.pair && (
            <p className="flex items-center gap-4 caption-1" aria-hidden="true">
              {copy.pair.map((name) => (
                <span key={name} className={`flex flex-col gap-1 ${name === lobe ? "story-ink" : "story-faint"}`}>
                  {lobeNames[name]}
                  <span className={`h-px w-full ${name === lobe ? "bg-current" : "bg-transparent"}`} />
                </span>
              ))}
            </p>
          )}

          <h3 className={`story-ink ${centre ? "heading-4 md:heading-3" : copy.pair ? "heading-3 lg:heading-1" : "heading-4 lg:heading-2"}`}>
            {lines.map((line) => (
              <span key={line} className={lines.length > 1 ? "block" : undefined}>
                {line}
              </span>
            ))}
          </h3>
          {copy.tagline && <p className="title-2 story-ink lg:title-1">{copy.tagline}</p>}
          <p className={`body-6 story-body lg:body-3 ${centre ? "max-w-md" : ""}`}>{copy.body}</p>
          {copy.note && <p className="caption-2 story-faint">{copy.note}</p>}
          {centre && <p className="max-w-md caption-5 story-faint">{modelCredit}</p>}
        </div>
      </div>
    </article>
  );
}

/**
 * Hero plus the scroll driven anatomy story.
 *
 * Layout: the cover scrolls away, then one frame pins for the rest of the
 * story. The copy for all six anatomy beats is stacked in that frame and
 * changes in place, so no scroll is spent moving panels on and off screen.
 * A separate sticky stage holds the single persistent canvas.
 *
 * Motion: one GSAP timeline, scrubbed by ScrollTrigger, tweens a single shot
 * object (camera, framing, emphasis, callouts, tone). The canvas reads that
 * object once per frame. React state changes only when the active beat does.
 */
export function BrainStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const shot = useRef<Shot>({ ...beats[0].wide });
  const [beat, setBeat] = useState(0);
  // Which beat's copy is showing: -1 while the camera is between beats.
  const [copy, setCopy] = useState(0);
  const [inView, setInView] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    gsap.registerPlugin(ScrollTrigger);

    let timeline: gsap.core.Timeline | null = null;
    let windows: BeatWindow[] = [];
    const applied = { tone: -1, hero: -1, beat: -1, copy: -2, dark: false };

    /** Everything outside the canvas that follows the timeline. Each write happens only on change. */
    const apply = () => {
      const s = shot.current;
      const tone = Math.round(s.tone * 200) / 200;
      if (tone !== applied.tone) {
        applied.tone = tone;
        for (const [name, value] of Object.entries(toneColours(tone))) section.style.setProperty(name, value);
        const dark = tone > 0.5;
        if (dark !== applied.dark) {
          applied.dark = dark;
          section.dataset.tone = dark ? "dark" : "light";
          section.dataset.navTone = dark ? "dark" : "light";
          window.dispatchEvent(new Event("na:tone"));
        }
      }
      const hero = Math.round(s.hero * 50) / 50;
      if (hero !== applied.hero && heroRef.current) {
        applied.hero = hero;
        heroRef.current.style.opacity = String(hero);
        heroRef.current.style.pointerEvents = hero < 0.1 ? "none" : "";
      }
      const now = activeBeat(timeline?.time() ?? 0, windows);
      if (now !== applied.beat) {
        applied.beat = now;
        setBeat(now);
      }
      const showing = copyBeat(timeline?.time() ?? 0, windows);
      if (showing !== applied.copy) {
        applied.copy = showing;
        setCopy(showing);
      }
    };

    const build = () => {
      timeline?.scrollTrigger?.kill();
      timeline?.kill();

      const vh = window.innerHeight;
      const origin = section.getBoundingClientRect().top + window.scrollY;
      const pin = track.getBoundingClientRect().top + window.scrollY - origin;
      const travel = Math.max(1, track.offsetHeight - vh);
      const span = Math.max(1, section.offsetHeight - vh);
      windows = scheduleBeats({ viewport: vh, pin, travel });
      // Anchor targets for the chapter rail and for links: one per beat, at the scroll offset where it arrives.
      track.style.setProperty("--step", `${stepFor(travel)}px`);

      const wide = window.innerWidth >= STORY_DESKTOP_MIN;
      const shots = resolveShots(wide, reducedMotion);
      Object.assign(shot.current, shots[0]);

      timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onUpdate: apply,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          // A short catch up smooths wheel steps. Reduced motion follows the scroll position exactly.
          scrub: reducedMotion ? true : 0.6,
        },
      });

      // One tween per move: every camera and emphasis field travels together.
      for (let i = 1; i < shots.length; i++) {
        const { hero: _hero, tone: _tone, ...move } = shots[i];
        const start = windows[i - 1].depart;
        timeline.to(shot.current, { ...move, duration: Math.max(1, windows[i].arrive - start) }, start);
      }
      // The cover copy clears first, then the room dims while the brain travels to the overview.
      // It is gone before it can scroll up into the brain.
      timeline.to(shot.current, { hero: 0, duration: vh * 0.11, ease: "none" }, vh * 0.02);
      const dimStart = vh * 0.2;
      timeline.to(shot.current, { tone: 1, duration: Math.max(1, windows[1].arrive - dimStart), ease: "sine.inOut" }, dimStart);
      // Pad to the full scroll distance so timeline time equals scroll offset.
      timeline.to({}, { duration: 0.001 }, span - 0.001);

      apply();
    };

    build();

    let frame = 0;
    const rebuild = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    };
    const ro = new ResizeObserver(rebuild);
    ro.observe(section);
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(section);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
    };
  }, [reducedMotion]);

  const current = beats[beat];

  return (
    <section ref={sectionRef} id="home" data-tone="light" data-nav-tone="light" className="story relative">
      {/* Copy layer. */}
      <div className="relative">
        <Hero ref={heroRef} />

        {/*
          The track sets how long the frame stays pinned. It starts a little before the
          cover has fully left, so the brain's move to the overview begins sooner.
        */}
        <div ref={trackRef} id="inside-the-brain" role="group" aria-label="Inside the human brain" className={`story-track relative -mt-[30svh] scroll-mt-0 ${TRACK_CLASS}`}>
          <h2 className="sr-only">Inside the human brain</h2>

          {/* Scroll targets: where each chapter begins on the timeline. */}
          {beats.slice(1).map((b, i) => {
            const copy = beatCopy[b.id as Exclude<BeatId, "hero">];
            return copy.chapterId ? (
              <span key={b.id} id={copy.chapterId} aria-hidden="true" className="pointer-events-none absolute left-0" style={{ top: `calc(var(--step, 35svh) * ${i} + 8px)`, scrollMarginTop: 0 }} />
            ) : null;
          })}

          <div className="story-frame pointer-events-none sticky top-0 h-svh">
            {beats.slice(1).map((b, i) => (
              <BeatBlock key={b.id} id={b.id} copy={beatCopy[b.id as Exclude<BeatId, "hero">]} lobe={b.lobe} active={copy === i + 1} />
            ))}
          </div>
        </div>
      </div>

      {/*
        Stage layer. It sits above the copy but ignores the pointer. On narrow
        screens its top band is opaque, so the cover copy slides under the brain
        instead of across it.
      */}
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-lvh overflow-hidden">
          <div className="story-bg absolute inset-x-0 top-0 h-[46%] lg:hidden" />
          <BrainStage shot={shot} beat={beat} active={inView} reducedMotion={reducedMotion} />

          <nav aria-label="Brain chapters" className="pointer-events-auto absolute right-8 top-1/2 hidden -translate-y-1/2 xl:block">
            <ol className="flex flex-col items-end gap-3">
              {railStops.map((stop, i) => {
                const here = i === current.chapter;
                return (
                  <li key={stop.id}>
                    <a href={`#${stop.id}`} aria-current={here ? "step" : undefined} className="group flex items-center gap-3 rounded-lg px-2 py-1">
                      <span className="caption-4 story-body opacity-0 transition-opacity motion-hover group-hover:opacity-100 group-focus-visible:opacity-100">
                        {stop.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full transition-[background-color,transform] motion-settle ${here ? "story-ink scale-150 bg-current" : "story-rule"}`}
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
