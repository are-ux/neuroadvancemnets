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

console.log(`vertices ${nTotal}, triangles ${tTotal}, glb ${(glb.byteLength / 1024).toFixed(0)} KB`);
for (const l of LOBE_ORDER) {
  const s = stats[l];
  console.log(`left ${l.padEnd(9)} centroid`, s.c.map((v) => (v / s.n).toFixed(3)).join(", "), `(${s.n} vertices)`);
}
