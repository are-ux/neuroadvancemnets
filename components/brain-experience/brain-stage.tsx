"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const BrainCanvas = dynamic(() => import("./brain-canvas"), { ssr: false });

type Props = {
  getPosition: () => number;
  active: boolean;
  reducedMotion: boolean;
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Owns the lifecycle around the 3D canvas: capability check, lazy loading,
 * the loading placeholder, and the static fallback when WebGL is unavailable.
 */
export function BrainStage({ getPosition, active, reducedMotion }: Props) {
  const [support, setSupport] = useState<"checking" | "webgl" | "none">("checking");
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    setSupport(hasWebGL() ? "webgl" : "none");
  }, []);

  // Same anchor as the 3D brain: right of the copy on wide screens, upper area on narrow ones.
  const anchor =
    "absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 lg:left-[71%] lg:top-1/2";

  return (
    <div
      className="absolute inset-0"
      role="img"
      aria-label="3D model of the human cerebral cortex. As you scroll, it turns to show the frontal, temporal, parietal, and occipital lobes, each highlighted in orange."
    >
      {support === "webgl" && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-settle ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <BrainCanvas getPosition={getPosition} active={active} reducedMotion={reducedMotion} onReady={onReady} />
        </div>
      )}

      {support !== "none" && !ready && (
        <div className={`${anchor} flex flex-col items-center gap-4`}>
          <div className="skeleton h-40 w-56 rounded-full bg-slate lg:h-72 lg:w-96" />
          <p className="caption-2 text-ice/70">Loading the 3D brain</p>
        </div>
      )}

      {support === "none" && (
        <div className={`${anchor} flex flex-col items-center gap-4`}>
          <div className="flex size-40 items-center justify-center rounded-full bg-soft lg:size-72">
            <Image src="/brand/mark.png" alt="" width={512} height={512} className="size-24 lg:size-40" />
          </div>
          <p className="max-w-64 text-center caption-2 text-ice/70">
            The interactive 3D brain needs WebGL, which this browser does not provide. Every chapter is still
            available as text.
          </p>
        </div>
      )}
    </div>
  );
}
