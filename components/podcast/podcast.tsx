"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Microphone } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { SignupForm } from "@/components/ui/signup-form";
import { useInView, useReducedMotion } from "@/lib/animations/hooks";

const SoundwaveCanvas = dynamic(() => import("./soundwave-canvas"), { ssr: false });

/** Flat bars shown while the 3D scene loads, and kept as the fallback without WebGL. */
function StaticWave() {
  const heights = [14, 22, 34, 52, 40, 64, 88, 70, 96, 76, 58, 82, 60, 44, 56, 36, 24, 30, 18, 12];
  return (
    <div aria-hidden="true" className="flex h-full items-center justify-center gap-2">
      {heights.map((h, i) => (
        <span key={i} className={`w-1 rounded-full ${i === 8 ? "bg-orange" : "bg-ice/60"}`} style={{ height: `${h}%`, maxHeight: 160 }} />
      ))}
    </div>
  );
}

export function Podcast() {
  // The 3D scene is only requested once the section approaches the viewport, and pauses when it leaves.
  const [nearRef, near] = useInView<HTMLDivElement>({ rootMargin: "30% 0px" });
  const [visibleRef, visible] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px" });
  const reducedMotion = useReducedMotion();
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebgl(Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  return (
    <section id="podcast" aria-labelledby="podcast-title" className="px-4 py-10 md:px-8 lg:py-12">
      <div ref={nearRef} className="mx-auto max-w-[1200px] overflow-hidden rounded-3xl bg-navy text-white">
        <div className="grid lg:grid-cols-12 lg:items-center">
          <Reveal className="flex flex-col gap-4 p-6 md:p-12 lg:col-span-6 lg:p-16">
            <p className="flex items-center gap-2 caption-1 text-ice">
              <Microphone aria-hidden="true" weight="fill" className="size-4 text-orange" />
              NeuroConversations podcast
              <span className="rounded-lg border border-white/20 px-2 py-1 caption-3 text-white">Coming soon</span>
            </p>
            <h2 id="podcast-title" className="heading-3 text-white lg:heading-2">
              Conversations worth thinking about.
            </h2>
            <p className="max-w-md body-3 text-ice lg:title-2">
              Exploring neuroscience through ideas, discoveries, and conversations with fascinating minds.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <p className="title-3 text-white">Hear about the first episode</p>
              <SignupForm list="podcast" submitLabel="Notify me" tone="dark" />
            </div>
          </Reveal>

          <div
            ref={visibleRef}
            role="img"
            aria-label="A soundwave made of rounded bars, shown in three dimensions."
            className="relative h-64 lg:col-span-6 lg:h-[480px]"
          >
            {webgl && near ? <SoundwaveCanvas active={visible} reducedMotion={reducedMotion} /> : <StaticWave />}
          </div>
        </div>
      </div>
    </section>
  );
}
