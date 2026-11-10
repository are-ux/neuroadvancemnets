# Redesign audit: homepage v1

Audit of the first build (commit `dd049f2`), taken from the code and assets, with the stage that addresses each finding.

## Why it reads as generic

- **One layout, repeated.** Hero and all five chapters use the same composition: copy on the left, brain on the right, same type sizes. NeuroBytes, the consultation panel, and the signup forms are all white rounded rectangles with a hairline border. (Stages B, D, E)
- **Orange everywhere.** Primary buttons, every section label dot, chapter numbers, nav indicator, tagline full stops, plate accents, and whole brain lobes. An accent used that often stops being an accent. (Stage B for buttons and labels, C for the brain, E for sections)
- **One reveal for everything.** Every block uses the same 32px rise and fade. (Stage E)
- **Flat rhythm.** Dark navy for 600svh, then five light sections in near identical off white. (Stages B, D, E)

## Navigation

- `bg-white/80` with a medium blur over a navy hero: at 80% opacity it reads as a solid grey white pill, not glass.
- It is sized to its content and centred, so it floats as a separate object instead of aligning with the page grid.
- **Logo:** the derivative `public/brand/logo.png` is correctly proportioned (960 x 195, ratio 4.92, matching the 1704 x 346 artwork inside the 2000 x 667 source, whose transparent margins are 170 / 126 / 161 / 160 px). The problem is display: it renders 24px tall, about 118px wide, so the wordmark is barely legible, and the 960px file is scaled down by a factor of eight in the browser, which softens it. (Stage B)

## Hero

- A standard split hero. Brain scale is modest, and the forced line breaks stack the headline into four lines in a half width column.
- Orange call to action on navy is the loudest element on the screen. (Stage B)

## Scroll chapters

- Hero 100svh plus five chapters at 100svh each: 600svh of the same navy with roughly 120 words of copy. Each chapter holds its text in the middle third and leaves the rest empty. (Stage D)
- The brain does stay visible for the whole sequence. The stage is `position: sticky` inside the section and was checked at every stop on desktop, tablet, and phone.
- Camera: one turntable rotation between stops. Framing, scale, and target never change, so it reads as "rotate, stop, rotate". Timing is a single eased blend over the middle 60% of each gap. (Stage D)
- If the canvas is unavailable the chapters remain readable, but each is a mostly empty dark screen. (Stage D)

## The 3D brain

| | Finding |
|---|---|
| Source | FreeSurfer `fsaverage6` pial surface, from TemplateFlow. Built by `scripts/build-brain.mjs`. |
| Geometry | 81,924 vertices, 163,840 triangles. Real cortical folding from an average of many MRI scans. Smooth normals. |
| Topology | Two closed hemisphere meshes with regular icosphere derived triangles. Clean, no holes. |
| Segmentation | Per vertex, from the Desikan Killiany atlas with FreeSurfer's standard lobe grouping. Anatomically correct for the four lobes. |
| Material | One `MeshPhysicalMaterial`, roughness 0.58, clearcoat 0.35. The clearcoat is the main cause of the plastic look. |
| Textures | None. Colour comes from two baked vertex channels (sulcal depth, lobe weights). |
| Highlight | Replaces base colour with full orange and dims everything else to navy. Crude: it hides cortical shading inside the lobe. |
| Lighting | Three directional lights plus a small environment. No ambient occlusion, no contact shadow, so the object does not sit in space. |
| Camera | Fixed at 30 degrees field of view, fixed distance, model rotates. |
| Performance | One draw call, 1.2 MB compressed, pixel ratio capped at 1.75, paused off screen. Sound. |
| Licence | FreeSurfer Software License. Needs a read through before commercial launch. |

**Verdict: keep the geometry and segmentation, rebuild the presentation.** The mesh is a credible anatomical cortex and the labels are correct. What looks unfinished is the material, the lighting, and the highlight. Two real limits remain: it is an *average* brain, so folds are softer than an individual scan, and it has no cerebellum or brainstem, which matters most in lateral and posterior views. Adding those needs a second licensed asset. (Stage C)

## Carried forward unchanged

Component structure, the deterministic story timeline, signup forms and API, legal pages, accessibility scaffolding (skip link, focus rings, reduced motion, WebGL fallback), and all content rules (no invented claims, dates, credentials, or testimonials).
