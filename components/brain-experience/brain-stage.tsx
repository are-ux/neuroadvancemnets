"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { qaSwitch } from "@/lib/animations/hooks";
import { beats, LOBE_CHANNELS, lobeNames, type Shot } from "@/lib/content/brain-chapters";

const BrainCanvas = dynamic(() => import("./brain-canvas"), { ssr: false });

/** DOM nodes of the anatomical callouts. The 3D scene positions them every frame, without React. */
export type CalloutNodes = {
  lines: (SVGLineElement | null)[];
  dots: (SVGCircleElement | null)[];
  labels: (HTMLSpanElement | null)[];
};

type Props = {
  shot: RefObject<Shot>;
  /** Active beat, used to pick the matching still when the 3D renderer is unavailable. */
  beat: number;
  active: boolean;
  reducedMotion: boolean;
};

function hasWebGL() {
  if (qaSwitch("webgl", "off")) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const stillAlt: Record<string, string> = {
  hero: "The cerebral cortex seen from the front left, showing the folded surface of both hemispheres.",
  overview: "Left side of the cerebral cortex with the boundaries of the four lobes outlined.",
  frontal: "The cortex from the front left with the frontal lobe lit, at the front of the hemisphere.",
  temporal: "The left side of the cortex with the temporal lobe lit, along the lower side of the hemisphere.",
  parietal: "The cortex from above and behind with the parietal lobe lit, at the upper rear of the hemisphere.",
  occipital: "The cortex from behind with the occipital lobe lit, at the back of the hemisphere.",
  complete: "The whole cerebral cortex with the boundaries of all four lobes outlined.",
};

/**
 * Static alternative to the 3D scene: one still per beat, captured from the same
 * renderer, placed where the brain sits in that beat's composition. Only the still
 * for the current beat, and any already seen, is requested.
 */
function BrainStills({ beat }: { beat: number }) {
  const [seen, setSeen] = useState<number[]>([beat]);
  useEffect(() => setSeen((list) => (list.includes(beat) ? list : [...list, beat])), [beat]);

  return (
    <>
      {beats.map((b, i) => {
        if (!seen.includes(i)) return null;
        const place = { "--x": `${b.wide.x * 100}%`, "--y": `${b.wide.y * 100}%` } as CSSProperties;
        return (
          <figure
            key={b.id}
            style={place}
            aria-hidden={i === beat ? undefined : true}
            className={`still-layer absolute left-1/2 top-[26%] flex w-72 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 lg:left-[calc(50%+var(--x))] lg:top-[calc(50%-var(--y))] lg:w-[30rem] ${i === beat ? "is-active" : ""}`}
          >
            <Image src={`/models/stills/${b.id}.webp`} alt={stillAlt[b.id]} width={1000} height={750} className="h-auto w-full" />
            <figcaption className="text-center caption-2 story-faint">
              {b.lobe ? `${lobeNames[b.lobe]}, lit. ` : ""}Static view: this browser cannot run the interactive 3D brain.
            </figcaption>
          </figure>
        );
      })}
    </>
  );
}

/**
 * Owns everything around the 3D canvas: capability check, lazy loading, the
 * loading placeholder, the callout layer, and the static alternative shown
 * when WebGL is unavailable.
 */
export function BrainStage({ shot, beat, active, reducedMotion }: Props) {
  const [support, setSupport] = useState<"checking" | "webgl" | "none">("checking");
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const callouts = useRef<CalloutNodes>({ lines: [], dots: [], labels: [] });

  useEffect(() => {
    setSupport(hasWebGL() ? "webgl" : "none");
  }, []);

  // Same anchor as the 3D brain on the cover: centred, upper area.
  const anchor = "absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 lg:top-[42%]";

  return (
    <div
      className="absolute inset-0"
      role="img"
      aria-label="3D model of the human cerebral cortex. As you scroll, the view moves across the frontal, temporal, parietal, and occipital lobes, lighting and naming each in turn."
    >
      {support === "webgl" && (
        <div className={`absolute inset-0 transition-opacity duration-700 ease-settle ${ready ? "opacity-100" : "opacity-0"}`}>
          <BrainCanvas shot={shot} callouts={callouts} active={active} reducedMotion={reducedMotion} onReady={onReady} />

          {/*
            Callouts: a dot on the anatomical anchor, a hairline leader, a small label.
            They are annotations of real atlas regions, drawn in the page's ink colour so
            they stay visually distinct from the decorative light on the brain's surface.
          */}
          <svg aria-hidden="true" className="story-ink absolute inset-0 size-full overflow-visible">
            {LOBE_CHANNELS.map((lobe, i) => (
              <g key={lobe}>
                <line
                  ref={(el) => {
                    callouts.current.lines[i] = el;
                  }}
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0"
                />
                <circle
                  ref={(el) => {
                    callouts.current.dots[i] = el;
                  }}
                  r="3"
                  fill="currentColor"
                  opacity="0"
                />
              </g>
            ))}
          </svg>
          {LOBE_CHANNELS.map((lobe, i) => (
            <span
              key={lobe}
              ref={(el) => {
                callouts.current.labels[i] = el;
              }}
              aria-hidden="true"
              className="absolute left-0 top-0 whitespace-nowrap caption-3 story-ink opacity-0 will-change-transform"
            >
              {lobeNames[lobe]}
            </span>
          ))}
        </div>
      )}

      {support !== "none" && !ready && (
        <div className={`${anchor} flex flex-col items-center gap-4`}>
          <div className="skeleton story-skeleton h-40 w-56 rounded-full lg:h-72 lg:w-96" />
          <p className="caption-2 story-faint">Loading the 3D brain</p>
        </div>
      )}

      {support === "none" && <BrainStills beat={beat} />}
    </div>
  );
}
