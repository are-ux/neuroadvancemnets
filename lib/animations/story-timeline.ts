import { brainChapters, heroView, LOBE_CHANNELS, type BrainView } from "@/lib/content/brain-chapters";

/**
 * Deterministic timeline for the brain story.
 *
 * The whole 3D state is a pure function of one number, the story position:
 * 0 is the hero, 1 the first chapter, and so on. Nothing is stacked or
 * triggered, so scrolling backward replays the exact same frames.
 */
export type StoryState = {
  azimuth: number;
  elevation: number;
  zoom: number;
  /** Weights for frontal, parietal, temporal, occipital. */
  highlight: [number, number, number, number];
  /** How strongly the cortex outside the highlight is dimmed. */
  dim: number;
  activity: number;
};

type Stop = { view: BrainView; highlight: [number, number, number, number]; dim: number; activity: number };

const oneHot = (index: number): [number, number, number, number] => {
  const w: [number, number, number, number] = [0, 0, 0, 0];
  if (index >= 0) w[index] = 1;
  return w;
};

const stops: Stop[] = [
  { view: heroView, highlight: oneHot(-1), dim: 0, activity: 0 },
  ...brainChapters.map((c) => ({
    view: c.view,
    highlight: oneHot(c.highlight ? LOBE_CHANNELS.indexOf(c.highlight) : -1),
    dim: c.highlight ? 1 : 0,
    activity: c.activity,
  })),
];

export const STORY_STOPS = stops.length;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Each stop holds still while its text is centred, and the move to the next
 * stop happens in the middle 60% of the gap between them.
 */
export function sampleStory(position: number, out: StoryState): StoryState {
  const p = Math.min(stops.length - 1, Math.max(0, position));
  const i = Math.min(stops.length - 2, Math.floor(p));
  const t = smoother(clamp01((p - i - 0.2) / 0.6));
  const a = stops[i];
  const b = stops[i + 1];
  out.azimuth = lerp(a.view.azimuth, b.view.azimuth, t);
  out.elevation = lerp(a.view.elevation, b.view.elevation, t);
  out.zoom = lerp(a.view.zoom, b.view.zoom, t);
  for (let k = 0; k < 4; k++) out.highlight[k] = lerp(a.highlight[k], b.highlight[k], t);
  out.dim = lerp(a.dim, b.dim, t);
  out.activity = lerp(a.activity, b.activity, t);
  return out;
}

export const createStoryState = (): StoryState => ({
  azimuth: heroView.azimuth,
  elevation: heroView.elevation,
  zoom: heroView.zoom,
  highlight: [0, 0, 0, 0],
  dim: 0,
  activity: 0,
});

/**
 * Converts a scroll offset into a story position, given the document space
 * centre of each stop's section. Linear between neighbouring centres.
 */
export function positionFromScroll(viewportCentre: number, centres: readonly number[]): number {
  if (centres.length < 2) return 0;
  if (viewportCentre <= centres[0]) return 0;
  for (let i = 0; i < centres.length - 1; i++) {
    if (viewportCentre <= centres[i + 1]) {
      return i + (viewportCentre - centres[i]) / (centres[i + 1] - centres[i]);
    }
  }
  return centres.length - 1;
}
