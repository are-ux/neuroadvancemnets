"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { labelOffsets, lobeAnchors, type Shot } from "@/lib/content/brain-chapters";
import { STORY_DESKTOP_MIN } from "@/lib/design-tokens";
import {
  buildRibbonGeometry,
  createBackdropMaterial,
  createBrainUniforms,
  createRibbonMaterial,
  createShellMaterials,
} from "./brain-materials";
import type { CalloutNodes } from "./brain-stage";

export const BRAIN_MODEL_URL = "/models/brain.glb";
const BRAIN_PATHS_URL = "/models/brain-paths.json";

type Props = {
  shot: RefObject<Shot>;
  callouts: RefObject<CalloutNodes>;
  reducedMotion: boolean;
  onReady: () => void;
};

const DEG = Math.PI / 180;
/** Camera distance the on screen sizes were authored at. */
const REFERENCE_DISTANCE = 6.2;
/** Moment at which the activity layer is frozen for reduced motion: a composed still. */
const STILL_TIME = 4.2;
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export function BrainModel({ shot, callouts, reducedMotion, onReady }: Props) {
  const gltf = useGLTF(BRAIN_MODEL_URL, false, true);
  const anchor = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const turn = useRef<THREE.Group>(null);
  const pivot = useRef<THREE.Group>(null);
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

  const intro = useRef(0);
  const scratch = useMemo(
    () => ({ point: new THREE.Vector3(), normal: new THREE.Vector3(), toCamera: new THREE.Vector3(), shown: [0, 0, 0, 0], widths: [0, 0, 0, 0] }),
    [],
  );

  useEffect(() => {
    onReady();
    invalidate();
  }, [onReady, invalidate]);

  useFrame((state, delta) => {
    const s = shot.current;
    if (!s || !anchor.current || !tilt.current || !turn.current || !pivot.current) return;
    const dt = Math.min(delta, 0.1);
    const camera = state.camera as THREE.PerspectiveCamera;
    const { width, height } = state.size;

    intro.current += (1 - intro.current) * (reducedMotion ? 1 : 1 - Math.exp(-1.6 * dt));

    // Camera: distance sets perspective. Framing and size are handled below so they stay as authored.
    camera.position.set(0, 0, s.distance);
    camera.updateMatrixWorld();
    const unit = 2 * Math.tan((camera.fov * DEG) / 2);
    const viewH = unit * s.distance;
    const viewW = viewH * (width / height);

    // Size on screen: fitted to the viewport at the reference distance, then held as the camera moves in.
    // The breakpoint matches the CSS one, which includes the scrollbar unlike the canvas width.
    const wide = window.innerWidth >= STORY_DESKTOP_MIN;
    const referenceW = unit * REFERENCE_DISTANCE * (width / height);
    // Narrow layouts: phones are limited by width, portrait tablets get a larger brain to fill their taller band.
    const tablet = window.innerWidth >= 640;
    const fit = wide ? Math.min(1.32, referenceW * 0.215) : Math.min(tablet ? 0.94 : 0.78, referenceW * 0.4);
    const scale = fit * s.zoom * (s.distance / REFERENCE_DISTANCE) * (0.95 + 0.05 * intro.current);
    const x = viewW * s.x;
    const y = viewH * s.y;
    anchor.current.position.set(x, y, 0);
    anchor.current.scale.setScalar(scale);

    // A slow, small drift keeps the object alive without ever reading as spinning.
    const t = state.clock.elapsedTime;
    const drift = reducedMotion ? 0 : 1;
    const azimuth = s.azimuth + Math.sin(t * 0.22) * 1.6 * drift - (1 - intro.current) * 10;
    const elevation = s.elevation + Math.sin(t * 0.17 + 1.3) * 0.8 * drift;
    // The framing point sits off the camera axis, which would skew the view by a few degrees.
    // Turning back by that angle keeps each shot at its authored anatomical view.
    turn.current.rotation.y = -azimuth * DEG - Math.atan2(x, s.distance);
    tilt.current.rotation.x = elevation * DEG + Math.atan2(y, s.distance);
    // Camera target: the brain turns about the point the shot is looking at.
    pivot.current.position.set(-s.fx, -s.fy, -s.fz);

    uniforms.uTone.value = s.tone;
    uniforms.uHighlight.value.set(s.h0, s.h1, s.h2, s.h3);
    uniforms.uDim.value = s.dim;
    uniforms.uAll.value = s.all;
    uniforms.uActivity.value = s.activity;
    uniforms.uTime.value = reducedMotion ? STILL_TIME : t;

    // Callouts: project each lobe's surface anchor through the live camera and place its label.
    const nodes = callouts.current;
    if (!nodes) return;
    anchor.current.updateWorldMatrix(false, true);
    const pxPerUnit = (height / viewH) * scale;
    const wanted = [s.l0, s.l1, s.l2, s.l3];
    for (let i = 0; i < 4; i++) {
      const line = nodes.lines[i];
      const dot = nodes.dots[i];
      const label = nodes.labels[i];
      if (!line || !dot || !label) continue;

      scratch.point.fromArray(lobeAnchors[i].position);
      pivot.current.localToWorld(scratch.point);
      scratch.normal.fromArray(lobeAnchors[i].normal).transformDirection(pivot.current.matrixWorld);
      scratch.toCamera.copy(camera.position).sub(scratch.point).normalize();
      // An anchor that turns away from the camera loses its callout instead of pointing through the brain.
      const facing = smooth(0.05, 0.32, scratch.normal.dot(scratch.toCamera));
      const visible = Math.round(wanted[i] * facing * intro.current * 50) / 50;

      if (visible === 0 && scratch.shown[i] === 0) continue;
      scratch.shown[i] = visible;
      const opacity = String(visible);
      line.setAttribute("opacity", String(visible * 0.55));
      dot.setAttribute("opacity", opacity);
      label.style.opacity = opacity;
      if (visible === 0) continue;

      scratch.point.project(camera);
      const ax = (scratch.point.x * 0.5 + 0.5) * width;
      const ay = (-scratch.point.y * 0.5 + 0.5) * height;
      // Overview and close up use different offsets; a shot between the two blends them.
      const near = wide ? labelOffsets.wide[i] : labelOffsets.narrow[i];
      const far = wide ? labelOffsets.wideClose[i] : labelOffsets.narrowClose[i];
      const ox = near[0] + (far[0] - near[0]) * s.dim;
      const oy = near[1] + (far[1] - near[1]) * s.dim;
      const right = ox > 0;
      // Keep the whole label on screen: its width is measured once, then reused.
      const labelWidth = (scratch.widths[i] ||= label.offsetWidth) + 24;
      const lx = Math.min(width - labelWidth, Math.max(labelWidth, ax + ox * pxPerUnit));
      // Labels stay clear of the navigation bar, with more air on wide screens.
      const ly = Math.max(wide ? 132 : 100, ay - oy * pxPerUnit);

      dot.setAttribute("cx", ax.toFixed(1));
      dot.setAttribute("cy", ay.toFixed(1));
      line.setAttribute("x1", ax.toFixed(1));
      line.setAttribute("y1", ay.toFixed(1));
      line.setAttribute("x2", lx.toFixed(1));
      line.setAttribute("y2", ly.toFixed(1));
      label.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translate(${right ? "8px" : "calc(-100% - 8px)"}, -50%)`;
    }
  });

  return (
    <group ref={anchor}>
      <mesh position={[0, 0, -1.3]} renderOrder={-1} material={materials.backdrop}>
        <planeGeometry args={[5.4, 4.2]} />
      </mesh>
      <group ref={tilt}>
        <group ref={turn}>
          <group ref={pivot}>
            <mesh geometry={geometry} material={materials.depth} matrix={matrix} matrixAutoUpdate={false} renderOrder={0} />
            <mesh geometry={geometry} material={materials.shell} matrix={matrix} matrixAutoUpdate={false} renderOrder={1} />
            {ribbons && <mesh geometry={ribbons} material={materials.ribbon} renderOrder={2} frustumCulled={false} />}
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(BRAIN_MODEL_URL, false, true);
