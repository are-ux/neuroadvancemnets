"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/lib/design-tokens";

const BARS = 44;
const ROWS = 3;
/** Indices of the few bars that carry the orange accent. */
const ACCENT = new Set([20, 21, 22]);

/** Amplitude of one bar: a slow envelope with finer movement layered on top. */
function level(i: number, row: number, t: number) {
  const x = i / (BARS - 1);
  const envelope = Math.sin(x * Math.PI) ** 1.4;
  const wave =
    0.5 +
    0.28 * Math.sin(x * 9 + t * 1.1 + row * 0.9) +
    0.16 * Math.sin(x * 23 - t * 1.7 + row * 2.1) +
    0.08 * Math.sin(x * 51 + t * 2.6);
  return 0.08 + Math.max(0, wave) * envelope * (1 - row * 0.22);
}

function Bars({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const write = (t: number) => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < BARS; i++) {
        const h = level(i, row, t) * 2.6;
        dummy.position.set((i - (BARS - 1) / 2) * 0.17, 0, -row * 0.55);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(row * BARS + i, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const front = new THREE.Color(colors.ice);
    const back = new THREE.Color("#35557A");
    const accent = new THREE.Color(colors.orange);
    const c = new THREE.Color();
    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < BARS; i++) {
        c.copy(row === 0 && ACCENT.has(i) ? accent : front).lerp(back, row === 0 ? 0 : row === 1 ? 0.6 : 0.9);
        mesh.setColorAt(row * BARS + i, c);
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    write(0.8);
  });

  useFrame((state) => {
    if (animate) write(state.clock.elapsedTime * 0.7);
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, BARS * ROWS]}>
      <capsuleGeometry args={[0.045, 1, 4, 10]} />
      <meshStandardMaterial roughness={0.45} metalness={0.05} />
    </instancedMesh>
  );
}

/** Three rows of capsule bars forming a soundwave with real depth. One draw call. */
export default function SoundwaveCanvas({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const animate = active && !reducedMotion;
  return (
    <Canvas
      frameloop={animate ? "always" : "demand"}
      dpr={[1, 1.5]}
      camera={{ fov: 32, position: [0, 0.9, 8.4] }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        camera.lookAt(0, 0, -0.4);
      }}
    >
      <hemisphereLight args={["#dde8f1", "#001a38", 1.1]} />
      <directionalLight position={[-3, 5, 6]} intensity={2.2} />
      <directionalLight position={[5, 2, -4]} intensity={0.8} color="#dde8f1" />
      <group rotation={[0, -0.42, 0]} position={[-0.35, 0, 0]}>
        <Bars animate={animate} />
      </group>
    </Canvas>
  );
}
