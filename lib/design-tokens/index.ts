/**
 * Design tokens shared with code that cannot read CSS variables (the 3D scenes).
 * The CSS source of truth lives in app/globals.css.
 */
export const colors = {
  paper: "#F7F8F6",
  surface: "#E9EDF0",
  ink: "#172A3E",
  slate: "#3F5165",
  mist: "#9EAEBB",
  accent: "#E47B36",
  accentDeep: "#B25A22",
  night: "#101A26",
  white: "#FFFFFF",
} as const;

/**
 * Cortex material palette for the 3D brain: a matte ivory with warm grey sulci.
 * The dim pair is what the cortex outside a highlighted lobe falls back to.
 */
export const cortex = {
  gyrus: "#EFEAE1",
  sulcus: "#A79C90",
  dimGyrus: "#53606E",
  dimSulcus: "#27323F",
} as const;

export const motion = {
  /** Base curve from the design skill: weighted, decelerating into place. */
  ease: [0.22, 1, 0.36, 1] as const,
  revealMs: 700,
  /** Exponential damping rate used by the 3D story so scroll never feels stepped. */
  storyDamping: 5.5,
} as const;

/** Viewport width, in CSS pixels, where the story switches to the side by side layout. */
export const STORY_DESKTOP_MIN = 1024;

/**
 * Band at the top of the viewport that decides the page tone under the navigation.
 * An element marked data-nav-tone="dark" that reaches this band turns the glass,
 * and the brain story, to their dark treatment at the same moment.
 */
export const TONE_BAND_MARGIN = "0px 0px -88% 0px";
