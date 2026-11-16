import anchorData from "./brain-anchors.json";

/**
 * Content and camera direction for the brain story.
 *
 * Lobe membership is not defined here. It is baked into the model per vertex
 * from the Desikan Killiany atlas (scripts/build-brain.mjs), so emphasis can
 * only land on cortex the atlas assigns to that lobe. Callout anchors are real
 * mesh vertices chosen by the same script (brain-anchors.json).
 */
export type LobeId = "frontal" | "parietal" | "temporal" | "occipital";

/** Order matches the COLOR_0 channels written into the model. */
export const LOBE_CHANNELS: readonly LobeId[] = ["frontal", "parietal", "temporal", "occipital"];

export const lobeNames: Record<LobeId, string> = {
  frontal: "Frontal lobe",
  parietal: "Parietal lobe",
  temporal: "Temporal lobe",
  occipital: "Occipital lobe",
};

type Vec3 = [number, number, number];
export const lobeAnchors = LOBE_CHANNELS.map((id) => anchorData[id] as { position: Vec3; normal: Vec3 });

/* ------------------------------------------------------------------
   Copy

   One block of copy per beat. The whole anatomy story is a single pinned
   stage, and these blocks change in place as the camera moves.
------------------------------------------------------------------- */
export type BeatCopy = {
  /** Chapter number and name, shown as the small label above the title. */
  index: number;
  chapter: string;
  /** Present on the first beat of a chapter: the id that links and the chapter rail point to. */
  chapterId?: string;
  title: string | readonly string[];
  tagline?: string;
  body: string;
  note?: string;
  /** The two lobes a chapter covers, so the pair can be shown with the current one marked. */
  pair?: readonly [LobeId, LobeId];
  /** Where the copy sits on wide screens. The brain takes the opposite side. */
  side: "left" | "right" | "centre";
};

export const beatCopy: Record<Exclude<BeatId, "hero">, BeatCopy> = {
  overview: {
    index: 1,
    chapter: "The human brain",
    chapterId: "the-human-brain",
    title: "One organ, four lobes, countless connections.",
    body: "The cerebral cortex is the folded outer layer of the brain. Anatomists divide each hemisphere into four lobes, each with its own part to play.",
    side: "left",
  },
  frontal: {
    index: 2,
    chapter: "Thought and memory",
    chapterId: "thought-and-memory",
    title: "Frontal lobe",
    tagline: "Where thought becomes action.",
    body: "The frontal lobe supports planning, decision making, and voluntary movement.",
    note: "These abilities rely on networks that reach well beyond any single lobe.",
    pair: ["frontal", "temporal"],
    side: "right",
  },
  temporal: {
    index: 2,
    chapter: "Thought and memory",
    title: "Temporal lobe",
    tagline: "Memory, meaning, and sound.",
    body: "Temporal regions contribute to hearing, language comprehension, and memory.",
    note: "These abilities rely on networks that reach well beyond any single lobe.",
    pair: ["frontal", "temporal"],
    side: "right",
  },
  parietal: {
    index: 3,
    chapter: "Perception and sensation",
    chapterId: "perception-and-sensation",
    title: "Parietal lobe",
    tagline: "Making sense of the world.",
    body: "The parietal lobe brings the senses together and supports spatial awareness.",
    note: "Seeing and sensing also draw on temporal and frontal regions.",
    pair: ["parietal", "occipital"],
    side: "left",
  },
  occipital: {
    index: 3,
    chapter: "Perception and sensation",
    title: "Occipital lobe",
    tagline: "How the brain sees.",
    body: "The occipital lobe holds the brain's primary visual processing areas.",
    note: "Seeing and sensing also draw on temporal and frontal regions.",
    pair: ["parietal", "occipital"],
    side: "left",
  },
  complete: {
    index: 4,
    chapter: "The complete picture",
    chapterId: "the-complete-picture",
    title: ["The more we understand the brain,", "the more possibilities we uncover."],
    body: "No lobe works alone. Thought, memory, and perception arise from networks that span the whole brain.",
    side: "centre",
  },
};

/** Chapter rail: each stop names the beat (index into beats) where its chapter begins. */
export const railStops = [
  { id: "home", label: "Introduction", beat: 0 },
  { id: "the-human-brain", label: "The human brain", beat: 1 },
  { id: "thought-and-memory", label: "Thought and memory", beat: 2 },
  { id: "perception-and-sensation", label: "Perception and sensation", beat: 4 },
  { id: "the-complete-picture", label: "The complete picture", beat: 6 },
] as const;

export const modelCredit =
  "Cortical surface and lobe boundaries from the FreeSurfer average brain and the Desikan Killiany atlas. The cerebellum and brainstem are not shown. Moving light on the surface is illustrative, not a map of real connections.";

/* ------------------------------------------------------------------
   Shots

   A shot is the complete state of the scene at one beat of the story.
   It is flat and numeric so one timeline can tween every field.

   azimuth    0 from behind, -90 left lateral, -180 from the front
   elevation  positive looks down from above
   distance   camera distance: closer strengthens perspective
   zoom       on screen size, independent of distance
   x, y       where the focus point sits, as fractions of the viewport from its centre
   fx fy fz   focus: the point on the brain that the camera targets (model space)
   h0..h3     emphasis per lobe (frontal, parietal, temporal, occipital)
   dim        how far the cortex outside the emphasis recedes
   all        fine outlines for every lobe at once
   l0..l3     callout visibility per lobe
   tone       0 paper, 1 night
   hero       opacity of the cover copy
------------------------------------------------------------------- */
export type Shot = {
  azimuth: number; elevation: number; distance: number; zoom: number; x: number; y: number;
  fx: number; fy: number; fz: number;
  h0: number; h1: number; h2: number; h3: number; dim: number; all: number; activity: number;
  l0: number; l1: number; l2: number; l3: number;
  tone: number; hero: number;
};

const base: Shot = {
  azimuth: -120, elevation: 10, distance: 6.2, zoom: 1, x: 0, y: 0,
  fx: 0, fy: 0, fz: 0,
  h0: 0, h1: 0, h2: 0, h3: 0, dim: 0, all: 0, activity: 0,
  l0: 0, l1: 0, l2: 0, l3: 0,
  tone: 1, hero: 0,
};

/** Aim the camera part of the way from the brain's centre toward a lobe. */
const focus = (lobe: LobeId, amount: number) => {
  const [fx, fy, fz] = anchorData[lobe].position.map((v) => v * amount);
  return { fx, fy, fz };
};
const emphasise = (lobe: LobeId) => {
  const i = LOBE_CHANNELS.indexOf(lobe);
  return { [`h${i}`]: 1, [`l${i}`]: 1, dim: 1 } as Partial<Shot>;
};
const allLabels = { l0: 1, l1: 1, l2: 1, l3: 1 };

export type BeatId = "hero" | "overview" | "frontal" | "temporal" | "parietal" | "occipital" | "complete";
export type Beat = { id: BeatId; chapter: number; lobe: LobeId | null; wide: Shot; narrow: Shot };

/** Narrow screens keep the brain in a fixed band at the top, so only framing inside that band changes. */
const NARROW_Y = 0.235;
const NARROW_CLOSE_Y = 0.2;

export const beats: readonly Beat[] = [
  {
    // Cover: a three quarter view, large and centred above the headline.
    id: "hero", chapter: 0, lobe: null,
    wide: { ...base, azimuth: -120, elevation: 10, zoom: 1.06, x: 0.02, y: 0.09, tone: 0, hero: 1 },
    narrow: { ...base, azimuth: -120, elevation: 10, y: NARROW_Y, tone: 0, hero: 1 },
  },
  {
    // Overview: a true lateral view, all four lobes outlined and named.
    id: "overview", chapter: 1, lobe: null,
    wide: { ...base, azimuth: -94, elevation: 10, zoom: 1.04, x: 0.16, y: 0, all: 1, ...allLabels },
    narrow: { ...base, azimuth: -92, elevation: 8, zoom: 0.92, y: NARROW_Y, all: 1, ...allLabels },
  },
  {
    // Frontal: the camera moves in from the front left, brain to the left of the copy.
    id: "frontal", chapter: 2, lobe: "frontal",
    wide: { ...base, azimuth: -124, elevation: 12, distance: 5, zoom: 1.14, x: -0.17, y: -0.05, ...focus("frontal", 0.5), ...emphasise("frontal") },
    narrow: { ...base, azimuth: -118, elevation: 10, distance: 5.4, zoom: 1, y: NARROW_CLOSE_Y, ...focus("frontal", 0.3), ...emphasise("frontal") },
  },
  {
    // Temporal: drop below the lateral sulcus and look slightly upward.
    id: "temporal", chapter: 2, lobe: "temporal",
    wide: { ...base, azimuth: -86, elevation: -14, distance: 5, zoom: 1.16, x: -0.17, y: 0.04, ...focus("temporal", 0.5), ...emphasise("temporal") },
    narrow: { ...base, azimuth: -88, elevation: -10, distance: 5.4, zoom: 1, y: NARROW_CLOSE_Y, ...focus("temporal", 0.3), ...emphasise("temporal") },
  },
  {
    // Parietal: cross to the right of the frame and rise above the crown.
    id: "parietal", chapter: 3, lobe: "parietal",
    wide: { ...base, azimuth: -62, elevation: 36, distance: 4.8, zoom: 1.08, x: 0.19, y: -0.08, ...focus("parietal", 0.5), ...emphasise("parietal") },
    narrow: { ...base, azimuth: -66, elevation: 30, distance: 5.4, zoom: 1, y: NARROW_CLOSE_Y, ...focus("parietal", 0.3), ...emphasise("parietal") },
  },
  {
    // Occipital: come round behind the brain.
    id: "occipital", chapter: 3, lobe: "occipital",
    wide: { ...base, azimuth: -26, elevation: 8, distance: 4.8, zoom: 1.16, x: 0.19, y: 0.02, ...focus("occipital", 0.5), ...emphasise("occipital") },
    narrow: { ...base, azimuth: -30, elevation: 8, distance: 5.4, zoom: 1, y: NARROW_CLOSE_Y, ...focus("occipital", 0.3), ...emphasise("occipital") },
  },
  {
    // Complete: pull back to the whole brain, centred above the closing statement.
    id: "complete", chapter: 4, lobe: null,
    wide: { ...base, azimuth: -72, elevation: 22, distance: 6.6, zoom: 0.84, x: 0, y: 0.16, all: 1, activity: 1 },
    narrow: { ...base, azimuth: -76, elevation: 18, zoom: 0.96, y: NARROW_Y, all: 1, activity: 1 },
  },
];

/**
 * Where each callout label sits relative to its anchor, in units of the brain's
 * on screen size (x right, y up). Chosen so labels fall outside the silhouette.
 */
export const labelOffsets: Record<"wide" | "wideClose" | "narrow" | "narrowClose", readonly [number, number][]> = {
  wide: [[-0.4, 0.5], [0.36, 0.5], [-0.36, -0.5], [0.3, -0.44]],
  // Close views fill more of the frame, so a label has further to travel to clear the brain.
  wideClose: [[-0.12, 0.74], [0.16, 0.9], [-0.3, -0.56], [0.36, -0.5]],
  narrow: [[-0.14, 0.6], [0.26, 0.56], [-0.2, -0.56], [0.3, -0.46]],
  narrowClose: [[-0.1, 0.8], [0.12, 0.86], [-0.2, -0.56], [0.3, -0.5]],
};

/**
 * Reduced motion: the brain keeps one steady lateral orientation and never moves in or
 * turns. It still takes each chapter's place in the layout, so copy and brain never
 * collide, and emphasis, outlines, and labels change as usual.
 */
export function stillShot(shot: Shot, _wide: boolean): Shot {
  const cover = shot.hero > 0;
  return {
    ...shot,
    azimuth: cover ? shot.azimuth : -92,
    elevation: cover ? shot.elevation : 8,
    distance: 6.2,
    zoom: cover ? shot.zoom : Math.min(shot.zoom, 1.02),
    fx: 0, fy: 0, fz: 0,
    activity: 0,
  };
}
