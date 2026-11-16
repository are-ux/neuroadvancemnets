"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { qaSwitch } from "@/lib/animations/hooks";
import { beats, LOBE_CHANNELS, lobeNames, type Shot } from "@/lib/content/brain-chapters";

/**
 * The 3D code is a separate chunk. Its download starts as soon as this module runs in
 * the browser, instead of waiting for the component to mount and ask for it.
 */
const loadCanvas = () => import("./brain-canvas");
const BrainCanvas = dynamic(loadCanvas, { ssr: false });
if (typeof window !== "undefined") void loadCanvas();

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
  /** True while the page is still at the cover, before the brain has started to move. */
  atCover: boolean;
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
 * The cover brain as an image, shown from the first paint.
 *
 * It is a capture of the live scene at rest on the cover, and it is placed with the same
 * rules the 3D scene uses to place the model (see brain-model.tsx), so the live brain can
 * fade in on top of it without anything appearing to move:
 *
 *   wide    brain size follows viewport width up to a cap, centred 2% right and 9% above the middle
 *   narrow  brain size follows viewport width up to a cap, centred 23.5% above the middle
 *
 * The capture covers 60% of the canvas width at 4:3 on a wide screen. The narrow sizes are
 * that figure scaled by how much larger the model is drawn there.
 */
function CoverStill({ visible }: { visible: boolean }) {
  return (
    <Image
      src="/models/stills/hero.webp"
      alt=""
      width={1000}
      height={750}
      preload
      fetchPriority="high"
      unoptimized
      className={`pointer-events-none absolute left-1/2 top-[26.5%] aspect-[4/3] h-auto w-[min(105%,61.8lvh)] max-w-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ease-settle sm:w-[min(105%,74.5lvh)] lg:left-[52%] lg:top-[41%] lg:w-[min(60%,110.9lvh)] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

/**
 * Static alternative to the 3D scene for the anatomy beats: one still per beat, captured
 * from the same renderer, placed where the brain sits in that beat's composition. A still
 * is requested only once its beat is reached. The cover uses CoverStill.
 */
function BrainStills({ beat }: { beat: number }) {
  const [seen, setSeen] = useState<number[]>([beat]);
  useEffect(() => setSeen((list) => (list.includes(beat) ? list : [...list, beat])), [beat]);

  return (
    <>
      {beats.map((b, i) => {
        if (i === 0 || !seen.includes(i)) return null;
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
 * Owns everything around the 3D canvas: the image shown from first paint, the capability
 * check, the hand over to the live scene, the callout layer, and the static alternative
 * shown when WebGL is unavailable.
 */
export function BrainStage({ shot, beat, atCover, active, reducedMotion }: Props) {
  const [support, setSupport] = useState<"checking" | "webgl" | "none">("checking");
  // "live" once the 3D scene has drawn a real frame. "settled" once it has finished fading in.
  const [live, setLive] = useState(false);
  const [settled, setSettled] = useState(false);
  const onReady = useCallback(() => setLive(true), []);
  const callouts = useRef<CalloutNodes>({ lines: [], dots: [], labels: [] });

  useEffect(() => {
    performance.mark("na:stage-mounted");
    setSupport(hasWebGL() ? "webgl" : "none");
  }, []);

  useEffect(() => {
    if (!live) return;
    performance.mark("na:live-visible");
    // The image stays until the live scene is fully opaque over it, then it is removed.
    const timer = window.setTimeout(() => setSettled(true), 450);
    return () => window.clearTimeout(timer);
  }, [live]);

  // The image is the cover pose. It is only correct while the page is at the cover.
  const showStill = atCover && (support === "none" || !settled);

  return (
    <div
      className="absolute inset-0"
      role="img"
      aria-label="3D model of the human cerebral cortex. As you scroll, the view moves across the frontal, temporal, parietal, and occipital lobes, lighting and naming each in turn."
    >
      {(support !== "webgl" || !settled) && <CoverStill visible={showStill} />}

      {support === "webgl" && (
        <div className={`absolute inset-0 transition-opacity duration-300 ease-settle ${live ? "opacity-100" : "opacity-0"}`}>
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

      {support === "none" && <BrainStills beat={beat} />}
    </div>
  );
}
