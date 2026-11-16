"use client";

import { Suspense, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { Shot } from "@/lib/content/brain-chapters";
import { BrainModel } from "./brain-model";
import type { CalloutNodes } from "./brain-stage";

type Props = {
  /** The shot the story timeline is tweening. Read once per frame, never through React state. */
  shot: RefObject<Shot>;
  callouts: RefObject<CalloutNodes>;
  /** Rendering pauses completely while the story is off screen. */
  active: boolean;
  reducedMotion: boolean;
  onReady: () => void;
};

/**
 * One persistent canvas for the whole brain story. Lighting lives in the brain
 * shaders (see brain-materials.ts), so the scene needs no lights or environment map.
 */
export default function BrainCanvas({ shot, callouts, active, reducedMotion, onReady }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 30, position: [0, 0, 6.2], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Suspense fallback={null}>
        <BrainModel shot={shot} callouts={callouts} reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
