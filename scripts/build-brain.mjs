/**
 * Builds public/models/brain.glb from FreeSurfer's fsaverage6 template.
 *
 * Inputs (scripts/brain-source, fetched from TemplateFlow, tpl-fsaverage):
 *   pial surface (41k vertices per hemisphere), sulcal depth, Desikan-Killiany labels.
 *
 * Output: one meshopt compressed mesh with
 *   POSITION, NORMAL
 *   COLOR_0     one hot lobe weights: r frontal, g parietal, b temporal, a occipital
 *   TEXCOORD_0  u = normalized sulcal depth (0 gyral crown, 1 deep sulcus), v = hemisphere (0 left, 1 right)
 *
 * Run: npm run build:brain
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { gunzipSync, inflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { reorder, quantize } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "scripts", "brain-source");

/** Standard FreeSurfer lobe grouping of Desikan-Killiany parcels. */
const LOBES = {
  frontal: [
    "superiorfrontal", "rostralmiddlefrontal", "caudalmiddlefrontal", "parsopercularis",
    "parstriangularis", "parsorbitalis", "lateralorbitofrontal", "medialorbitofrontal",
    "precentral", "paracentral", "frontalpole",
  ],
  parietal: ["superiorparietal", "inferiorparietal", "supramarginal", "postcentral", "precuneus"],
  temporal: [
    "superiortemporal", "middletemporal", "inferiortemporal", "bankssts", "fusiform",
    "transversetemporal", "entorhinal", "temporalpole", "parahippocampal",
  ],
  occipital: ["lateraloccipital", "lingual", "cuneus", "pericalcarine"],
};
const LOBE_ORDER = ["frontal", "parietal", "temporal", "occipital"];

function parseGifti(file) {
  const xml = readFileSync(join(src, file), "utf8");
  const labels = new Map();
  for (const m of xml.matchAll(/<Label\s+Key="(\d+)"[^>]*><!\[CDATA\[(.*?)\]\]><\/Label>/g)) {
    labels.set(Number(m[1]), m[2]);
  }
  const arrays = [];
  for (const m of xml.matchAll(/<DataArray([^>]*)>([\s\S]*?)<\/DataArray>/g)) {
    const attr = Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    const b64 = m[2].match(/<Data>([\s\S]*?)<\/Data>/)[1].replace(/\s+/g, "");
    let buf = Buffer.from(b64, "base64");
    if (attr.Encoding === "GZipBase64Binary") {
      try { buf = inflateSync(buf); } catch { buf = gunzipSync(buf); }
    }
    if (attr.Endian !== "LittleEndian") throw new Error("Unexpected endianness in " + file);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const data =
      attr.DataType === "NIFTI_TYPE_FLOAT32" ? new Float32Array(ab)
      : attr.DataType === "NIFTI_TYPE_INT32" ? new Int32Array(ab)
      : null;
    if (!data) throw new Error("Unsupported type " + attr.DataType);
    arrays.push({ intent: attr.Intent, data });
  }
  return { arrays, labels };
}

const hemis = ["L", "R"].map((h) => {
  const surf = parseGifti(`tpl-fsaverage_hemi-${h}_den-41k_pial.surf.gii`);
  const sulc = parseGifti(`tpl-fsaverage_hemi-${h}_den-41k_sulc.shape.gii`);
  const lab = parseGifti(`tpl-fsaverage_hemi-${h}_den-41k_atlas-Desikan2006_seg-aparc_dseg.label.gii`);
  return {
    h,
    pos: surf.arrays.find((a) => a.intent === "NIFTI_INTENT_POINTSET").data,
    tri: surf.arrays.find((a) => a.intent === "NIFTI_INTENT_TRIANGLE").data,
    sulc: sulc.arrays[0].data,
    lab: lab.arrays[0].data,
    names: lab.labels,
  };
});

const nTotal = hemis.reduce((n, h) => n + h.pos.length / 3, 0);
const tTotal = hemis.reduce((n, h) => n + h.tri.length / 3, 0);
const position = new Float32Array(nTotal * 3);
const color = new Uint8Array(nTotal * 4);
const uv = new Float32Array(nTotal * 2);
const index = new Uint32Array(tTotal * 3);

// Bounds in scanner space, for centring and scaling.
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const h of hemis) {
  for (let i = 0; i < h.pos.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], h.pos[i + k]);
      max[k] = Math.max(max[k], h.pos[i + k]);
    }
  }
}
const centre = min.map((v, k) => (v + max[k]) / 2);
const scale = 2 / Math.max(...max.map((v, k) => v - min[k])); // longest axis spans 2 units

/** Lobe index per vertex, or -1 where the atlas assigns none of the four lobes (medial wall, cingulate, insula). */
const lobeOf = new Int8Array(nTotal).fill(-1);
const stats = Object.fromEntries(LOBE_ORDER.map((l) => [l, { n: 0, c: [0, 0, 0] }]));
let vOff = 0;
let tOff = 0;
hemis.forEach((h, hi) => {
  const n = h.pos.length / 3;
  for (let i = 0; i < n; i++) {
    // RAS (x right, y anterior, z superior) to three.js (x right, y up, z toward viewer = posterior).
    const x = (h.pos[i * 3] - centre[0]) * scale;
    const y = (h.pos[i * 3 + 2] - centre[2]) * scale;
    const z = -(h.pos[i * 3 + 1] - centre[1]) * scale;
    const o = (vOff + i) * 3;
    position[o] = x; position[o + 1] = y; position[o + 2] = z;

    const name = h.names.get(h.lab[i]) ?? "unknown";
    const li = LOBE_ORDER.findIndex((l) => LOBES[l].includes(name));
    if (li >= 0) {
      lobeOf[vOff + i] = li;
      color[(vOff + i) * 4 + li] = 255;
      if (hi === 0) {
        const s = stats[LOBE_ORDER[li]];
        s.n++; s.c[0] += x; s.c[1] += y; s.c[2] += z;
      }
    }
    // FreeSurfer sulc: negative on gyral crowns, positive in sulcal depths.
    uv[(vOff + i) * 2] = Math.min(1, Math.max(0, (h.sulc[i] + 1.6) / 3.2));
    uv[(vOff + i) * 2 + 1] = hi;
  }
  for (let i = 0; i < h.tri.length; i++) index[tOff + i] = h.tri[i] + vOff;
  vOff += n;
  tOff += h.tri.length;
});

// Vertex adjacency, shared by the boundary smoothing and the surface paths below.
const neighbours = Array.from({ length: nTotal }, () => []);
{
  const link = (a, b) => { if (!neighbours[a].includes(b)) neighbours[a].push(b); };
  for (let i = 0; i < index.length; i += 3) {
    const [a, b, c] = [index[i], index[i + 1], index[i + 2]];
    link(a, b); link(b, a); link(b, c); link(c, b); link(a, c); link(c, a);
  }
}

/*
 * The atlas labels each vertex, so a lobe boundary drawn from raw labels follows triangle
 * edges in a sawtooth. A few passes of neighbour averaging over the lobe weights turn that
 * into a smooth contour. The 0.5 level, where the outline is drawn, stays on the atlas boundary.
 */
{
  let w = Float32Array.from(color, (c) => c / 255);
  for (let pass = 0; pass < 8; pass++) {
    const next = new Float32Array(w.length);
    for (let v = 0; v < nTotal; v++) {
      const nb = neighbours[v];
      for (let k = 0; k < 4; k++) {
        let sum = 0;
        for (const o of nb) sum += w[o * 4 + k];
        next[v * 4 + k] = 0.5 * w[v * 4 + k] + 0.5 * (sum / nb.length);
      }
    }
    w = next;
  }
  for (let i = 0; i < w.length; i++) color[i] = Math.round(w[i] * 255);
}

// Area weighted smooth normals.
const normal = new Float32Array(nTotal * 3);
for (let i = 0; i < index.length; i += 3) {
  const a = index[i] * 3, b = index[i + 1] * 3, c = index[i + 2] * 3;
  const e1 = [position[b] - position[a], position[b + 1] - position[a + 1], position[b + 2] - position[a + 2]];
  const e2 = [position[c] - position[a], position[c + 1] - position[a + 1], position[c + 2] - position[a + 2]];
  const nx = e1[1] * e2[2] - e1[2] * e2[1];
  const ny = e1[2] * e2[0] - e1[0] * e2[2];
  const nz = e1[0] * e2[1] - e1[1] * e2[0];
  for (const v of [a, b, c]) { normal[v] += nx; normal[v + 1] += ny; normal[v + 2] += nz; }
}
let outward = 0;
for (let i = 0; i < normal.length; i += 3) {
  const l = Math.hypot(normal[i], normal[i + 1], normal[i + 2]) || 1;
  normal[i] /= l; normal[i + 1] /= l; normal[i + 2] /= l;
  outward += normal[i] * position[i] + normal[i + 1] * position[i + 1] + normal[i + 2] * position[i + 2];
}
if (outward < 0) throw new Error("Normals point inward: winding flipped by the coordinate transform.");

/* ------------------------------------------------------------------
   Surface paths for the neural activity layer.

   These are a visual metaphor, not tractography. Each path is a walk
   along mesh edges that prefers gyral crowns and keeps its heading, so
   the light it carries travels over real cortical folds instead of
   cutting through the brain. Nothing here represents a measured
   connection.
------------------------------------------------------------------- */
function buildPaths() {
  let seed = 20261110;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const P = (v) => [position[v * 3], position[v * 3 + 1], position[v * 3 + 2]];
  const N = (v) => [normal[v * 3], normal[v * 3 + 1], normal[v * 3 + 2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  const perHemi = 30;
  const hemiSize = nTotal / 2;
  const used = new Uint8Array(nTotal);
  const starts = [];
  const paths = [];

  for (let h = 0; h < 2; h++) {
    let made = 0;
    for (let attempt = 0; attempt < 6000 && made < perHemi; attempt++) {
      const start = h * hemiSize + Math.floor(rand() * hemiSize);
      if (lobeOf[start] < 0 || uv[start * 2] > 0.34 || used[start]) continue;
      const sp = P(start);
      if (starts.some((s) => Math.hypot(...sub(s, sp)) < 0.16)) continue;

      // Initial heading: any direction in the tangent plane.
      const n0 = N(start);
      let d = norm(sub([rand() - 0.5, rand() - 0.5, rand() - 0.5], n0.map((c) => c * dot([0.3, 0.2, 0.1], n0))));
      const length = 44 + Math.floor(rand() * 52);
      const verts = [start];
      const seen = new Set([start]);
      let cur = start;
      for (let step = 0; step < length; step++) {
        const cp = P(cur);
        let best = -1, bestScore = -Infinity, bestDir = null;
        for (const nb of neighbours[cur]) {
          if (seen.has(nb) || lobeOf[nb] < 0) continue;
          const dir = norm(sub(P(nb), cp));
          const heading = dot(dir, d);
          if (heading < -0.1) continue;
          const score = heading - uv[nb * 2] * 1.5 - used[nb] * 2 + rand() * 0.3;
          if (score > bestScore) { bestScore = score; best = nb; bestDir = dir; }
        }
        if (best < 0) break;
        d = norm([d[0] * 0.78 + bestDir[0] * 0.22, d[1] * 0.78 + bestDir[1] * 0.22, d[2] * 0.78 + bestDir[2] * 0.22]);
        verts.push(best);
        seen.add(best);
        cur = best;
      }
      if (verts.length < 34) continue;

      for (const v of verts) { used[v] = 1; for (const nb of neighbours[v]) used[nb] = 1; }
      starts.push(sp);

      // Smooth the stair stepped edge walk, then keep every second point.
      let pts = verts.map(P);
      let nrm = verts.map(N);
      for (let pass = 0; pass < 4; pass++) {
        const blend = (arr) => arr.map((p, i) => {
          if (i === 0 || i === arr.length - 1) return p;
          const a = arr[i - 1], b = arr[i + 1];
          return [0.25 * a[0] + 0.5 * p[0] + 0.25 * b[0], 0.25 * a[1] + 0.5 * p[1] + 0.25 * b[1], 0.25 * a[2] + 0.5 * p[2] + 0.25 * b[2]];
        });
        pts = blend(pts);
        nrm = blend(nrm).map(norm);
      }
      const keep = verts.map((_, i) => i).filter((i) => i % 2 === 0 || i === verts.length - 1);
      const r = (v, dp) => Number(v.toFixed(dp));
      paths.push({
        seed: r(rand(), 3),
        // Lifted a hair off the surface so it never fights the cortex for depth.
        p: keep.flatMap((i) => pts[i].map((c, k) => r(c + nrm[i][k] * 0.007, 4))),
        n: keep.flatMap((i) => nrm[i].map((c) => r(c, 3))),
        l: keep.map((i) => lobeOf[verts[i]]),
      });
      made++;
    }
  }
  return paths;
}
const paths = buildPaths();

/* ------------------------------------------------------------------
   Callout anchors.

   One point per lobe on the lateral surface of the left hemisphere,
   used by the page to attach annotation leaders. Each is a real mesh
   vertex: on a gyral crown, well inside its lobe (away from the atlas
   boundary), and as close as possible to a point pushed outward from
   the lobe's centroid.
------------------------------------------------------------------- */
function buildAnchors() {
  const outward = { frontal: [-1, 0.3, -0.15], parietal: [-0.9, 0.5, 0.1], temporal: [-1, -0.15, 0.05], occipital: [-0.65, 0.05, 0.75] };
  const anchors = {};
  LOBE_ORDER.forEach((name, li) => {
    const c = stats[name].c.map((v) => v / stats[name].n);
    const d = outward[name];
    const dl = Math.hypot(...d);
    const aim = c.map((v, k) => v + (d[k] / dl) * 0.6);
    let best = -1, bestDist = Infinity;
    for (let v = 0; v < nTotal / 2; v++) {
      if (lobeOf[v] !== li || uv[v * 2] > 0.3 || color[v * 4 + li] < 250) continue;
      const dist = Math.hypot(position[v * 3] - aim[0], position[v * 3 + 1] - aim[1], position[v * 3 + 2] - aim[2]);
      if (dist < bestDist) { bestDist = dist; best = v; }
    }
    const r = (x) => Number(x.toFixed(4));
    anchors[name] = {
      position: [0, 1, 2].map((k) => r(position[best * 3 + k])),
      normal: [0, 1, 2].map((k) => r(normal[best * 3 + k])),
    };
  });
  return anchors;
}
const anchors = buildAnchors();

const doc = new Document();
doc.createExtension(KHRMeshQuantization).setRequired(true);
doc.createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
const buffer = doc.createBuffer();
const prim = doc.createPrimitive()
  .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(position).setBuffer(buffer))
  .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(normal).setBuffer(buffer))
  .setAttribute("COLOR_0", doc.createAccessor().setType("VEC4").setArray(color).setNormalized(true).setBuffer(buffer))
  .setAttribute("TEXCOORD_0", doc.createAccessor().setType("VEC2").setArray(uv).setBuffer(buffer))
  .setIndices(doc.createAccessor().setType("SCALAR").setArray(index).setBuffer(buffer))
  .setMaterial(doc.createMaterial("cortex"));
const mesh = doc.createMesh("cortex").addPrimitive(prim);
doc.createScene("brain").addChild(doc.createNode("cortex").setMesh(mesh));
doc.getRoot().getAsset().copyright =
  "Geometry and labels derived from FreeSurfer fsaverage6 (Fischl et al. 1999) and the Desikan-Killiany atlas (Desikan et al. 2006), FreeSurfer Software License.";

await MeshoptEncoder.ready;
await doc.transform(
  reorder({ encoder: MeshoptEncoder }),
  quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 10, quantizeColor: 8 }),
);

const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const out = join(root, "public", "models");
mkdirSync(out, { recursive: true });
const glb = await io.writeBinary(doc);
writeFileSync(join(out, "brain.glb"), glb);
const pathsJson = JSON.stringify({ note: "Decorative surface paths. Not measured neural connections.", paths });
writeFileSync(join(out, "brain-paths.json"), pathsJson);
writeFileSync(join(root, "lib", "content", "brain-anchors.json"), JSON.stringify(anchors, null, 2) + "\n");
console.log("anchors", JSON.stringify(anchors));
console.log(`paths ${paths.length}, points ${paths.reduce((n, p) => n + p.l.length, 0)}, json ${(pathsJson.length / 1024).toFixed(0)} KB`);

console.log(`vertices ${nTotal}, triangles ${tTotal}, glb ${(glb.byteLength / 1024).toFixed(0)} KB`);
for (const l of LOBE_ORDER) {
  const s = stats[l];
  console.log(`left ${l.padEnd(9)} centroid`, s.c.map((v) => (v / s.n).toFixed(3)).join(", "), `(${s.n} vertices)`);
}
