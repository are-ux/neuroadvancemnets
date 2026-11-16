import { beats, stillShot, type Shot } from "@/lib/content/brain-chapters";

/**
 * Scheduling for the brain story.
 *
 * The story is one GSAP timeline scrubbed by scroll. Its time axis is scroll
 * distance in pixels from the top of the story section.
 *
 * Layout it describes: the cover scrolls away, then a single frame pins and
 * stays pinned while the visitor scrolls through the six anatomy beats. Every
 * beat gets the same distance (a step). A beat holds for the first part of its
 * step and the camera travels to the next beat in the remainder, so no scroll
 * is spent on copy moving in or out.
 */
export type StoryMetrics = {
  viewport: number;
  /** Scroll offset at which the anatomy frame pins. */
  pin: number;
  /** Scroll distance the frame stays pinned for. */
  travel: number;
};

export type BeatWindow = { arrive: number; depart: number };

/** Anatomy beats after the cover. */
const PINNED_BEATS = beats.length - 1;
/** Share of each step spent holding still before the camera moves on. */
const HOLD = 0.3;
/** Extra hold on the last beat, in steps, before the frame releases. */
const TAIL = 0.4;

/** Scroll distance given to one beat. */
export const stepFor = (travel: number) => travel / (PINNED_BEATS - 1 + TAIL);

export function scheduleBeats(m: StoryMetrics): BeatWindow[] {
  const step = stepFor(m.travel);
  const windows: BeatWindow[] = [{ arrive: 0, depart: m.viewport * 0.08 }];
  for (let i = 0; i < PINNED_BEATS; i++) {
    const arrive = i === 0 ? m.pin - m.viewport * 0.04 : m.pin + i * step;
    const depart = i === PINNED_BEATS - 1 ? m.pin + m.travel : m.pin + (i + HOLD) * step;
    windows.push({ arrive, depart });
  }
  // Keep the schedule strictly ordered whatever the layout measures to.
  for (let i = 1; i < windows.length; i++) {
    windows[i].arrive = Math.max(windows[i].arrive, windows[i - 1].depart + 1);
    windows[i].depart = Math.max(windows[i].depart, windows[i].arrive);
  }
  return windows;
}

export function resolveShots(wide: boolean, reducedMotion: boolean): Shot[] {
  return beats.map((beat) => {
    const shot = wide ? beat.wide : beat.narrow;
    return reducedMotion ? stillShot(shot, wide) : shot;
  });
}

/** The beat the timeline is closest to: decides which copy is on screen. */
export function activeBeat(time: number, windows: readonly BeatWindow[]): number {
  let active = 0;
  for (let i = 1; i < windows.length; i++) {
    const midpoint = (windows[i - 1].depart + windows[i].arrive) / 2;
    if (time >= midpoint) active = i;
  }
  return active;
}

/**
 * The beat whose copy should be on screen, or -1 while the camera is mid move.
 * Copy leaves shortly after its beat departs and the next arrives shortly before
 * its beat does, so the brain never travels across text.
 */
export function copyBeat(time: number, windows: readonly BeatWindow[]): number {
  for (let i = 0; i < windows.length; i++) {
    const before = i === 0 ? 0 : (windows[i].arrive - windows[i - 1].depart) * 0.28;
    const after = i === windows.length - 1 ? Infinity : (windows[i + 1].arrive - windows[i].depart) * 0.22;
    if (time >= windows[i].arrive - before && time <= windows[i].depart + after) return i;
  }
  return -1;
}

const hex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((c, i) => Math.round(c + (y[i] - c) * t)).join(" ")})`;
};

/** Page colours for the story at a given tone: 0 is paper, 1 is night. */
export function toneColours(tone: number) {
  return {
    "--story-bg": mixHex("#f7f8f6", "#101a26", tone),
    "--story-ink": mixHex("#172a3e", "#f7f8f6", tone),
    "--story-body": mixHex("#3f5165", "#c7d0d8", tone),
    "--story-faint": mixHex("#6b7c8d", "#9eaebb", tone),
    "--story-rule": mixHex("#cfd5da", "#3a4654", tone),
    "--story-skeleton": mixHex("#e9edf0", "#1b2836", tone),
  } as const;
}
