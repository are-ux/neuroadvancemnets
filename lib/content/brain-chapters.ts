/**
 * Anatomical region data and story chapters for the scroll driven brain.
 *
 * Lobe membership is not defined here. It is baked into the model per vertex
 * from the Desikan Killiany atlas (see scripts/build-brain.mjs), so a highlight
 * can only ever land on the cortex that the atlas assigns to that lobe.
 *
 * Views use a turntable convention for the left hemisphere:
 *   azimuth   0 = from behind, -90 = left lateral, -180 = from the front
 *   elevation positive = looking down from above
 */
export type LobeId = "frontal" | "parietal" | "temporal" | "occipital";

/** Order matches the COLOR_0 channels written into the model. */
export const LOBE_CHANNELS: readonly LobeId[] = ["frontal", "parietal", "temporal", "occipital"];

export type BrainView = { azimuth: number; elevation: number; zoom: number };

export type BrainChapter = {
  id: string;
  /** Short label shown in the chapter rail and above the heading. */
  label: string;
  heading: string;
  description: string;
  /** Plain anatomical location, shown as a caption under the description. */
  location?: string;
  highlight: LobeId | null;
  /** 0 to 1, strength of the whole brain activity shimmer. */
  activity: number;
  view: BrainView;
};

export const heroView: BrainView = { azimuth: -128, elevation: 12, zoom: 1 };

export const brainChapters: readonly BrainChapter[] = [
  {
    id: "frontal-lobe",
    label: "Frontal lobe",
    heading: "Where thought becomes action.",
    description:
      "Explore the role of the frontal lobe in planning, decision making, and voluntary movement.",
    location: "The front of each hemisphere, ahead of the central sulcus.",
    highlight: "frontal",
    activity: 0,
    view: { azimuth: -108, elevation: 8, zoom: 1.04 },
  },
  {
    id: "temporal-lobe",
    label: "Temporal lobe",
    heading: "Memory, meaning, and sound.",
    description:
      "Discover how temporal regions contribute to hearing, language comprehension, and memory.",
    location: "Along the side of each hemisphere, below the lateral sulcus.",
    highlight: "temporal",
    activity: 0,
    view: { azimuth: -90, elevation: -10, zoom: 1.04 },
  },
  {
    id: "parietal-lobe",
    label: "Parietal lobe",
    heading: "Making sense of the world.",
    description: "Explore sensory integration and spatial awareness.",
    location: "Behind the central sulcus, above the temporal lobe.",
    highlight: "parietal",
    activity: 0,
    view: { azimuth: -64, elevation: 30, zoom: 1.04 },
  },
  {
    id: "occipital-lobe",
    label: "Occipital lobe",
    heading: "How the brain sees.",
    description: "Discover the brain's remarkable visual processing systems.",
    location: "The back of each hemisphere.",
    highlight: "occipital",
    activity: 0,
    view: { azimuth: -32, elevation: 10, zoom: 1.04 },
  },
  {
    id: "complete-brain",
    label: "The whole brain",
    heading: "The more we understand the brain, the more possibilities we uncover.",
    description:
      "No lobe works alone. Thought, memory, and perception arise from networks that span the whole brain.",
    highlight: null,
    activity: 1,
    view: { azimuth: -58, elevation: 20, zoom: 0.96 },
  },
];

export const modelCredit =
  "Cortical surface and lobe boundaries from the FreeSurfer average brain and the Desikan Killiany atlas. The cerebellum and brainstem are not shown.";
