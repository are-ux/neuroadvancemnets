"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { BrainModel } from "./brain-model";

type Props = {
  getPosition: () => number;
  /** Rendering pauses completely while the story is off screen. */
  active: boolean;
  reducedMotion: boolean;
  onReady: () => void;
};

/** Studio lighting: a warm key, a cool fill, and a rim to separate the brain from the navy. */
function Studio() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#7d8794", 0.5]} />
      <directionalLight position={[-3.5, 4.5, 5]} intensity={2.5} color="#fff6ec" />
      <directionalLight position={[4.5, 1, 3]} intensity={0.55} color="#cfe0f2" />
      <directionalLight position={[2.5, 3, -5]} intensity={1.5} color="#dde8f1" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[-4, 5, 4]} scale={[8, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.9} position={[6, 0, 2]} scale={[4, 8, 1]} color="#dde8f1" />
        <Lightformer form="rect" intensity={0.5} position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} color="#5c6672" />
      </Environment>
    </>
  );
}

export default function BrainCanvas({ getPosition, active, reducedMotion, onReady }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 30, position: [0, 0, 6.2], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Studio />
      <Suspense fallback={null}>
        <BrainModel getPosition={getPosition} reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
