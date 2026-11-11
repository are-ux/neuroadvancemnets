"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion, STORY_DESKTOP_MIN } from "@/lib/design-tokens";
import { createStoryState, sampleStory } from "@/lib/animations/story-timeline";
import {
  buildRibbonGeometry,
  createBackdropMaterial,
  createBrainUniforms,
  createRibbonMaterial,
  createShellMaterials,
} from "./brain-materials";

export const BRAIN_MODEL_URL = "/models/brain.glb";
const BRAIN_PATHS_URL = "/models/brain-paths.json";

type Props = {
  /** Current story position, read every frame. No React state is involved. */
  getPosition: () => number;
  /** True while the page behind the brain is in its night treatment. */
  dark: boolean;
  reducedMotion: boolean;
  onReady: () => void;
};

const DEG = Math.PI / 180;
/** Moment at which the activity layer is frozen for reduced motion: a composed still. */
const STILL_TIME = 4.2;

export function BrainModel({ getPosition, dark, reducedMotion, onReady }: Props) {
  const gltf = useGLTF(BRAIN_MODEL_URL, false, true);
  const anchor = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const turn = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);
  const invalidate = useThree((s) => s.invalidate);

  // Pure derivations only: StrictMode runs memo callbacks twice, so nothing here may depend on call order.
  const { geometry, matrix } = useMemo(() => {
    const source = gltf.scene.getObjectByProperty("isMesh", true) as THREE.Mesh;
    const geometry = source.geometry;
    // Rename the baked channels so three.js does not treat them as colour or texture input.
    if (geometry.attributes.color) {
      geometry.setAttribute("lobe", geometry.attributes.color);
      geometry.deleteAttribute("color");
    }
    if (geometry.attributes.uv) {
      geometry.setAttribute("surf", geometry.attributes.uv);
      geometry.deleteAttribute("uv");
    }
    source.updateMatrix();
    // The node matrix undoes the mesh quantization applied at build time.
    return { geometry, matrix: source.matrix.clone() };
  }, [gltf]);

  const uniforms = useMemo(createBrainUniforms, []);
  const materials = useMemo(
    () => ({ ...createShellMaterials(uniforms), ribbon: createRibbonMaterial(uniforms), backdrop: createBackdropMaterial(uniforms) }),
    [uniforms],
  );
  useEffect(
    () => () => {
      materials.depth.dispose();
      materials.shell.dispose();
      materials.ribbon.dispose();
      materials.backdrop.dispose();
    },
    [materials],
  );

  // The activity layer is not needed for first paint, so its data loads after the brain is on screen.
  const [ribbons, setRibbons] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    let cancelled = false;
    let built: THREE.BufferGeometry | null = null;
    fetch(BRAIN_PATHS_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (cancelled) return;
        built = buildRibbonGeometry(data.paths);
        setRibbons(built);
      })
      .catch(() => {
        // The brain is complete without this layer. Leave it out if the file cannot be read.
      });
    return () => {
      cancelled = true;
      built?.dispose();
    };
  }, []);

  const target = useMemo(createStoryState, []);
  const current = useMemo(createStoryState, []);
  const intro = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    onReady();
    invalidate();
  }, [onReady, invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    sampleStory(getPosition(), target);

    // Reduced motion keeps one lateral view where all four lobes are visible; only the emphasis changes.
    if (reducedMotion) {
      target.azimuth = -90;
      target.elevation = 8;
      target.zoom = 1;
    }

    const first = !started.current;
    const k = first || reducedMotion ? 1 : 1 - Math.exp(-motion.storyDamping * dt);
    started.current = true;
    current.azimuth += (target.azimuth - current.azimuth) * k;
    current.elevation += (target.elevation - current.elevation) * k;
    current.zoom += (target.zoom - current.zoom) * k;
    current.x += (target.x - current.x) * k;
    current.y += (target.y - current.y) * k;
    current.dim += (target.dim - current.dim) * k;
    current.activity += (target.activity - current.activity) * k;
    for (let i = 0; i < 4; i++) current.highlight[i] += (target.highlight[i] - current.highlight[i]) * k;

    intro.current += (1 - intro.current) * (reducedMotion ? 1 : 1 - Math.exp(-1.6 * dt));

    // A slow, small sway gives depth without ever reading as spinning.
    const t = state.clock.elapsedTime;
    const sway = reducedMotion ? 0 : 1;
    // Entry: the brain turns the last few degrees into its cover pose as it fades in.
    const azimuth = current.azimuth + Math.sin(t * 0.22) * 2.2 * sway - (1 - intro.current) * 10;
    const elevation = current.elevation + Math.sin(t * 0.17 + 1.3) * 1.1 * sway;

    if (anchor.current && tilt.current && turn.current) {
      // Anchor: authored per chapter on wide screens, upper area on narrow ones.
      // Matches the CSS lg breakpoint, which includes the scrollbar unlike the canvas width.
      const wide = window.innerWidth >= STORY_DESKTOP_MIN;
      const x = wide ? viewport.width * current.x : 0;
      const y = wide ? viewport.height * current.y : viewport.height * 0.235;
      const fit = wide ? Math.min(1.32, viewport.width * 0.215) : Math.min(0.78, viewport.width * 0.4);
      anchor.current.scale.setScalar(fit * current.zoom * (0.95 + 0.05 * intro.current));
      anchor.current.position.set(x, y, 0);

      // The brain sits off the camera axis, which would skew every view by a few degrees.
      // Turning it back by the same angle keeps each chapter at its authored anatomical view.
      const distance = state.camera.position.z;
      turn.current.rotation.y = -azimuth * DEG - Math.atan2(x, distance);
      tilt.current.rotation.x = elevation * DEG + Math.atan2(y, distance);
    }

    const tone = dark ? 1 : 0;
    uniforms.uTone.value += (tone - uniforms.uTone.value) * (first || reducedMotion ? 1 : 1 - Math.exp(-3.2 * dt));
    uniforms.uHighlight.value.fromArray(current.highlight);
    uniforms.uDim.value = current.dim;
    uniforms.uActivity.value = current.activity;
    uniforms.uTime.value = reducedMotion ? STILL_TIME : t;
  });

  return (
    <group ref={anchor}>
      <mesh position={[0, 0, -1.3]} renderOrder={-1} material={materials.backdrop}>
        <planeGeometry args={[5.4, 4.2]} />
      </mesh>
      <group ref={tilt}>
        <group ref={turn}>
          <mesh geometry={geometry} material={materials.depth} matrix={matrix} matrixAutoUpdate={false} renderOrder={0} />
          <mesh geometry={geometry} material={materials.shell} matrix={matrix} matrixAutoUpdate={false} renderOrder={1} />
          {ribbons && <mesh geometry={ribbons} material={materials.ribbon} renderOrder={2} frustumCulled={false} />}
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(BRAIN_MODEL_URL, false, true);
