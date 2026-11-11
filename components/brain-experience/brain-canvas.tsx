"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { BrainModel } from "./brain-model";

type Props = {
  getPosition: () => number;
  /** Rendering pauses completely while the story is off screen. */
  active: boolean;
  /** Page tone behind the brain: selects the paper or night lighting preset. */
  dark: boolean;
  reducedMotion: boolean;
  onReady: () => void;
};

/**
 * One persistent canvas for the whole brain story. Lighting lives in the brain
 * shaders (see brain-materials.ts), so the scene needs no lights or environment map.
 */
export default function BrainCanvas({ getPosition, active, dark, reducedMotion, onReady }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 30, position: [0, 0, 6.2], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Suspense fallback={null}>
        <BrainModel getPosition={getPosition} dark={dark} reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
