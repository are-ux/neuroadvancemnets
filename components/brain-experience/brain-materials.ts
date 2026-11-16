import * as THREE from "three";
import { brainPalette } from "@/lib/design-tokens";

/**
 * Materials for the layered brain visualization.
 *
 *   Layer A  cortical shell   a translucent, softly lit surface. Not a physical material:
 *                             form comes from wrapped studio light, depth from the baked
 *                             sulcal channel, and the glass quality from a view dependent
 *                             edge (opaque and luminous at grazing angles, airy face on).
 *   Layer B  neural ribbons   thin strips lying on the cortex that carry travelling light.
 *   Layer C  lobe emphasis    part of the shell shader: tint, lift, and a fine atlas outline.
 *
 * Every layer reads the same uniform objects, so one write per frame drives them all.
 * Each look has a paper preset and a night preset, blended by uTone, so the brain reads
 * on the pale hero and in the dark chapters without changing the page to suit the effect.
 */
export type BrainUniforms = {
  uTone: { value: number };
  uTime: { value: number };
  uDim: { value: number };
  uActivity: { value: number };
  uAll: { value: number };
  uHighlight: { value: THREE.Vector4 };
};

export const createBrainUniforms = (): BrainUniforms => ({
  uTone: { value: 0 },
  uTime: { value: 0 },
  uDim: { value: 0 },
  uActivity: { value: 0 },
  uAll: { value: 0 },
  uHighlight: { value: new THREE.Vector4(0, 0, 0, 0) },
});

const color = (hex: string) => ({ value: new THREE.Color(hex) });

const shellVertex = /* glsl */ `
attribute vec4 lobe;
attribute vec2 surf;
varying vec3 vNormal;
varying vec3 vView;
varying vec4 vLobe;
varying float vDepth;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = -mv.xyz;
  vLobe = lobe;
  vDepth = surf.x;
  gl_Position = projectionMatrix * mv;
}`;

const shellFragment = /* glsl */ `
uniform float uTone;
uniform float uDim;
uniform float uAll;
uniform vec4 uHighlight;
uniform vec3 uGyrusL; uniform vec3 uSulcusL; uniform vec3 uShadeL; uniform vec3 uRimL; uniform vec3 uGhostL; uniform vec3 uLobeL; uniform vec3 uEdgeL;
uniform vec3 uGyrusD; uniform vec3 uSulcusD; uniform vec3 uShadeD; uniform vec3 uRimD; uniform vec3 uLobeD; uniform vec3 uEdgeD;
varying vec3 vNormal;
varying vec3 vView;
varying vec4 vLobe;
varying float vDepth;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float facing = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.0);

  // Sulcal depth from the anatomical surface data: 0 on gyral crowns, 1 deep in a sulcus.
  float depth = smoothstep(0.33, 0.8, vDepth);

  // Soft studio light in view space, wrapped so no side ever falls to black.
  float key = dot(N, normalize(vec3(-0.46, 0.62, 0.63))) * 0.5 + 0.5;
  float fill = dot(N, normalize(vec3(0.78, 0.04, 0.5))) * 0.5 + 0.5;
  float light = clamp(pow(key, 1.35) * 0.84 + fill * 0.16, 0.0, 1.0);
  float sheen = pow(key, 16.0) * (1.0 - depth);

  float lobe = clamp(dot(vLobe, uHighlight), 0.0, 1.0);
  float inside = lobe * uDim;
  float away = (1.0 - lobe) * uDim;
  // Fine line where the atlas boundary of the highlighted lobe runs.
  float edge = (1.0 - smoothstep(0.0, fwidth(lobe) * 1.6 + 0.0001, abs(lobe - 0.5))) * uDim;

  // Overview: a contour wherever one lobe meets another, or meets cortex outside the four lobes.
  float top = max(max(vLobe.x, vLobe.y), max(vLobe.z, vLobe.w));
  float contour = (1.0 - smoothstep(0.0, fwidth(top) * 1.5 + 0.0001, abs(top - 0.5))) * uAll;

  // Paper preset: pearl crowns, ice blue folds, azure glass edge.
  vec3 baseL = mix(uGyrusL, uSulcusL, depth);
  vec3 colL = mix(baseL * uShadeL, baseL, smoothstep(0.12, 0.9, light));
  colL *= mix(1.0, 0.9, depth * depth);
  colL = mix(colL, uRimL, rim * 0.88);
  colL += vec3(sheen * 0.16);
  colL = mix(colL, mix(colL, uGhostL, 0.66), away);
  colL = mix(colL, mix(colL, uLobeL, 0.3 + 0.2 * depth), inside);

  // Night preset: blue translucent body with a luminous cyan white edge.
  vec3 baseD = mix(uGyrusD, uSulcusD, depth);
  vec3 colD = mix(baseD * uShadeD, baseD, light);
  colD += uRimD * rim * 0.8;
  colD += vec3(sheen * 0.08);
  colD = mix(colD, colD * 0.36, away);
  colD += uLobeD * (0.07 + 0.2 * (1.0 - depth) * light) * inside;

  vec3 col = mix(colL, colD, uTone);
  col = mix(col, mix(uEdgeL, uEdgeD, uTone), max(edge * 0.8, contour * 0.6));

  // Apparent translucency: airy where the surface faces the viewer, solid toward the silhouette.
  float body = mix(0.96, 0.74, uTone);
  float alpha = mix(body, 1.0, clamp(rim * 1.4 + depth * 0.25, 0.0, 1.0));
  alpha = mix(alpha, alpha * mix(0.7, 0.82, uTone), away);
  alpha = max(alpha, max(edge, contour * 0.7));

  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}`;

/**
 * The shell is drawn in two passes: depth only, then colour. The colour pass can then
 * blend with the page behind it without ever blending with the far side of the brain,
 * which removes transparency sorting artifacts on a folded surface.
 */
export function createShellMaterials(shared: BrainUniforms) {
  const p = brainPalette;
  // Depth only: a minimal program, which compiles faster than a built in material.
  const depth = new THREE.ShaderMaterial({
    // The position must be computed exactly as the shell computes it. Any difference in the
    // order of operations changes the depth by a rounding error, and the shell then fails its
    // depth test in scattered pixels.
    vertexShader: "void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "void main() { gl_FragColor = vec4(0.0); }",
    colorWrite: false,
    toneMapped: false,
  });
  const shell = new THREE.ShaderMaterial({
    vertexShader: shellVertex,
    fragmentShader: shellFragment,
    transparent: true,
    depthWrite: false,
    depthFunc: THREE.LessEqualDepth,
    toneMapped: false,
    uniforms: {
      ...shared,
      uGyrusL: color(p.paper.gyrus), uSulcusL: color(p.paper.sulcus), uShadeL: color(p.paper.shade), uRimL: color(p.paper.rim),
      uGhostL: color(p.paper.ghost), uLobeL: color(p.paper.lobe), uEdgeL: color(p.paper.edge),
      uGyrusD: color(p.night.gyrus), uSulcusD: color(p.night.sulcus), uShadeD: color(p.night.shade), uRimD: color(p.night.rim),
      uLobeD: color(p.night.lobe), uEdgeD: color(p.night.edge),
    },
  });
  return { depth, shell };
}

const ribbonVertex = /* glsl */ `
attribute vec2 along;
attribute float seed;
attribute vec4 lobe;
varying vec2 vAlong;
varying float vSeed;
varying vec4 vLobe;

void main() {
  vAlong = along;
  vSeed = seed;
  vLobe = lobe;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ribbonFragment = /* glsl */ `
uniform float uTone;
uniform float uTime;
uniform float uDim;
uniform float uActivity;
uniform vec4 uHighlight;
uniform vec3 uLineL; uniform vec3 uPulseL; uniform vec3 uLineD; uniform vec3 uPulseD;
varying vec2 vAlong;
varying float vSeed;
varying vec4 vLobe;

void main() {
  float u = vAlong.x;
  float across = 1.0 - abs(vAlong.y);
  float soft = across * across * (3.0 - 2.0 * across);
  float ends = smoothstep(0.0, 0.1, u) * smoothstep(1.0, 0.9, u);

  // One pulse per path, travelling for part of a slow cycle and resting for the remainder.
  float period = mix(6.5, 11.0, fract(vSeed * 7.31));
  float cycle = fract(uTime / period + vSeed);
  float head = cycle * 2.4 - 0.2;
  float behind = head - u;
  float pulse = behind > 0.0 ? exp(-behind * 6.5) : exp(-behind * behind * 2200.0);

  float lobe = clamp(dot(vLobe, uHighlight), 0.0, 1.0);
  float focus = mix(1.0, mix(0.18, 1.5, lobe), uDim);

  float line = mix(0.42, 0.34, uTone);
  float glow = pulse * (1.1 + 0.7 * uActivity);
  float alpha = clamp((line + glow) * ends * soft * focus, 0.0, 1.0);

  vec3 col = mix(mix(uLineL, uPulseL, clamp(glow, 0.0, 1.0)), mix(uLineD, uPulseD, clamp(glow, 0.0, 1.0)), uTone);
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}`;

export function createRibbonMaterial(shared: BrainUniforms) {
  const p = brainPalette;
  return new THREE.ShaderMaterial({
    vertexShader: ribbonVertex,
    fragmentShader: ribbonFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      ...shared,
      uLineL: color(p.paper.line), uPulseL: color(p.paper.pulse),
      uLineD: color(p.night.line), uPulseD: color(p.night.pulse),
    },
  });
}

const backdropVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const backdropFragment = /* glsl */ `
uniform float uTone;
uniform vec3 uHaloL; uniform vec3 uHaloD; uniform vec3 uShadow;
varying vec2 vUv;

void main() {
  // A soft halo behind the brain stands in for bloom, at no post processing cost.
  float r = length((vUv - vec2(0.5, 0.52)) * vec2(2.0, 2.5));
  float halo = smoothstep(1.0, 0.0, r);
  halo *= halo;
  float haloA = halo * mix(0.5, 0.34, uTone);

  // On paper, a faint shadow beneath it sets the object in space.
  float d = length((vUv - vec2(0.5, 0.3)) * vec2(3.4, 16.0));
  float shadow = smoothstep(1.0, 0.0, d);
  float shadowA = shadow * shadow * 0.12 * (1.0 - uTone);

  float alpha = haloA + shadowA * (1.0 - haloA);
  vec3 col = mix(mix(uHaloL, uHaloD, uTone), uShadow, shadowA / max(alpha, 0.0001));
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}`;

export function createBackdropMaterial(shared: BrainUniforms) {
  const p = brainPalette;
  return new THREE.ShaderMaterial({
    vertexShader: backdropVertex,
    fragmentShader: backdropFragment,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    uniforms: { uTone: shared.uTone, uHaloL: color(p.paper.halo), uHaloD: color(p.night.halo), uShadow: color(p.paper.shadow) },
  });
}

type PathData = { seed: number; p: number[]; n: number[]; l: number[] };

/**
 * Turns the baked surface paths into one ribbon mesh. Each point becomes two vertices,
 * offset sideways in the plane of the cortex, so the strip lies flat on the surface.
 */
export function buildRibbonGeometry(paths: PathData[], halfWidth = 0.0062) {
  const total = paths.reduce((n, path) => n + path.l.length, 0);
  const position = new Float32Array(total * 2 * 3);
  const along = new Float32Array(total * 2 * 2);
  const seed = new Float32Array(total * 2);
  const lobe = new Float32Array(total * 2 * 4);
  const index: number[] = [];

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const n = new THREE.Vector3();
  const side = new THREE.Vector3();
  let v = 0;

  for (const path of paths) {
    const count = path.l.length;
    for (let i = 0; i < count; i++) {
      const prev = Math.max(0, i - 1) * 3;
      const next = Math.min(count - 1, i + 1) * 3;
      a.fromArray(path.p, prev);
      b.fromArray(path.p, next);
      n.fromArray(path.n, i * 3);
      side.subVectors(b, a).cross(n).normalize().multiplyScalar(halfWidth);
      a.fromArray(path.p, i * 3);

      for (let s = 0; s < 2; s++) {
        const sign = s === 0 ? -1 : 1;
        position.set([a.x + side.x * sign, a.y + side.y * sign, a.z + side.z * sign], v * 3);
        along.set([i / (count - 1), sign], v * 2);
        seed[v] = path.seed;
        if (path.l[i] >= 0) lobe[v * 4 + path.l[i]] = 1;
        v++;
      }
      if (i > 0) index.push(v - 4, v - 3, v - 2, v - 3, v - 1, v - 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("along", new THREE.BufferAttribute(along, 2));
  geometry.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
  geometry.setAttribute("lobe", new THREE.BufferAttribute(lobe, 4));
  geometry.setIndex(index);
  return geometry;
}
