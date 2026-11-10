"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { colors, cortex, motion, STORY_DESKTOP_MIN } from "@/lib/design-tokens";
import { createStoryState, sampleStory } from "@/lib/animations/story-timeline";

export const BRAIN_MODEL_URL = "/models/brain.glb";

type Props = {
  /** Current story position, read every frame. No React state is involved. */
  getPosition: () => number;
  reducedMotion: boolean;
  onReady: () => void;
};

const DEG = Math.PI / 180;

/**
 * Cortex material: a physical material whose base colour is driven by two
 * per vertex signals baked into the model, sulcal depth and lobe membership.
 */
function createCortexMaterial() {
  const uniforms = {
    uHighlight: { value: new THREE.Vector4() },
    uDim: { value: 0 },
    uActivity: { value: 0 },
    uTime: { value: 0 },
    uDequant: { value: new THREE.Matrix4() },
    uGyrus: { value: new THREE.Color(cortex.gyrus) },
    uSulcus: { value: new THREE.Color(cortex.sulcus) },
    uDimGyrus: { value: new THREE.Color(cortex.dimGyrus) },
    uDimSulcus: { value: new THREE.Color(cortex.dimSulcus) },
    uOrange: { value: new THREE.Color(colors.orange) },
    uOrangeDeep: { value: new THREE.Color(colors.orangeDeep) },
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.58,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.9,
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec4 lobe;
attribute vec2 surf;
uniform mat4 uDequant;
varying vec4 vLobe;
varying vec2 vSurf;
varying vec3 vObj;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vLobe = lobe;
vSurf = surf;
vObj = (uDequant * vec4(position, 1.0)).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec4 vLobe;
varying vec2 vSurf;
varying vec3 vObj;
uniform vec4 uHighlight;
uniform float uDim;
uniform float uActivity;
uniform float uTime;
uniform vec3 uGyrus;
uniform vec3 uSulcus;
uniform vec3 uDimGyrus;
uniform vec3 uDimSulcus;
uniform vec3 uOrange;
uniform vec3 uOrangeDeep;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float naDepth = smoothstep(0.36, 0.82, vSurf.x);
float naLobe = clamp(dot(vLobe, uHighlight), 0.0, 1.0);
vec3 naBase = mix(mix(uGyrus, uSulcus, naDepth), mix(uDimGyrus, uDimSulcus, naDepth), uDim);
diffuseColor.rgb = mix(naBase, mix(uOrange, uOrangeDeep, naDepth), naLobe);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
totalEmissiveRadiance += uOrange * naLobe * 0.1 * (1.0 - naDepth);
if (uActivity > 0.001) {
  float naAct = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float ph = uTime * 0.2 + fi * 1.7;
    vec3 c = vec3(sin(ph * 1.3 + fi) * 0.5, cos(ph * 0.9 + fi * 2.1) * 0.4 + 0.1, sin(ph * 0.7 + fi * 0.6) * 0.8);
    float d = distance(vObj, c);
    float env = 0.5 + 0.5 * sin(uTime * 0.55 + fi * 2.4);
    naAct += exp(-d * d * 7.0) * env;
  }
  totalEmissiveRadiance += uOrange * naAct * uActivity * 0.32 * (1.0 - naDepth * 0.75);
}`,
      );
  };

  return { material, uniforms };
}

export function BrainModel({ getPosition, reducedMotion, onReady }: Props) {
  const gltf = useGLTF(BRAIN_MODEL_URL, false, true);
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

  const { material, uniforms } = useMemo(createCortexMaterial, []);
  useEffect(() => {
    uniforms.uDequant.value.copy(matrix);
    return () => material.dispose();
  }, [material, uniforms, matrix]);

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

    // Reduced motion keeps one lateral view where all four lobes are visible; only colour changes.
    if (reducedMotion) {
      target.azimuth = -90;
      target.elevation = 8;
      target.zoom = 1;
    }

    const k = !started.current || reducedMotion ? 1 : 1 - Math.exp(-motion.storyDamping * dt);
    started.current = true;
    current.azimuth += (target.azimuth - current.azimuth) * k;
    current.elevation += (target.elevation - current.elevation) * k;
    current.zoom += (target.zoom - current.zoom) * k;
    current.dim += (target.dim - current.dim) * k;
    current.activity += (target.activity - current.activity) * k;
    for (let i = 0; i < 4; i++) current.highlight[i] += (target.highlight[i] - current.highlight[i]) * k;

    intro.current += (1 - intro.current) * (reducedMotion ? 1 : 1 - Math.exp(-2.2 * dt));

    // A slow, small sway gives depth without ever reading as spinning.
    const t = state.clock.elapsedTime;
    const sway = reducedMotion ? 0 : 1;
    const azimuth = current.azimuth + Math.sin(t * 0.22) * 2.2 * sway;
    const elevation = current.elevation + Math.sin(t * 0.17 + 1.3) * 1.1 * sway;

    if (turn.current && tilt.current) {
      // Anchor: right of the copy on wide screens, upper area on narrow ones.
      // Matches the CSS lg breakpoint, which includes the scrollbar unlike the canvas width.
      const wide = window.innerWidth >= STORY_DESKTOP_MIN;
      const x = wide ? viewport.width * 0.21 : 0;
      const y = wide ? 0 : viewport.height * 0.235;
      const fit = wide ? Math.min(1.32, viewport.width * 0.215) : Math.min(0.78, viewport.width * 0.4);
      tilt.current.scale.setScalar(fit * current.zoom * (0.94 + 0.06 * intro.current));
      tilt.current.position.set(x, y, 0);

      // The brain sits off the camera axis, which would skew every view by a few degrees.
      // Turning it back by the same angle keeps each chapter at its authored anatomical view.
      const distance = state.camera.position.z;
      turn.current.rotation.y = -azimuth * DEG - Math.atan2(x, distance);
      tilt.current.rotation.x = elevation * DEG + Math.atan2(y, distance);
    }

    uniforms.uHighlight.value.fromArray(current.highlight);
    uniforms.uDim.value = current.dim;
    uniforms.uActivity.value = reducedMotion ? 0 : current.activity;
    uniforms.uTime.value = t;
  });

  return (
    <group ref={tilt}>
      <group ref={turn}>
        <mesh geometry={geometry} material={material} matrix={matrix} matrixAutoUpdate={false} />
      </group>
    </group>
  );
}

useGLTF.preload(BRAIN_MODEL_URL, false, true);
