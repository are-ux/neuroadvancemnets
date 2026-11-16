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
 * Palette for the layered brain visualization, one preset per page tone.
 * Paper: pearl crowns, ice blue folds, an azure glass edge, fine blue traces.
 * Night: a blue translucent body with a cyan white edge and bright traces.
 * Orange is deliberately absent: lobes are emphasised with light, not brand colour.
 */
export const brainPalette = {
  paper: {
    gyrus: "#F2F7FB",
    sulcus: "#3B7BB8",
    shade: "#92B3DA",
    rim: "#165C9F",
    ghost: "#E9EEF2",
    lobe: "#49B4EC",
    edge: "#1669AE",
    line: "#1877C2",
    pulse: "#0096E6",
    halo: "#BCD9F1",
    shadow: "#172A3E",
  },
  night: {
    gyrus: "#6FAFE0",
    sulcus: "#123B62",
    shade: "#3E5E8C",
    rim: "#C6F0FF",
    lobe: "#5FCBFF",
    edge: "#E8FAFF",
    line: "#E2F7FF",
    pulse: "#FFFFFF",
    halo: "#2C8AD0",
  },
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
 * Any element carrying data-nav-tone is watched; while one marked "dark" sits in this
 * band the glass switches to its frosted treatment. The brain story flips its own
 * attribute as it dims and announces the change with a "na:tone" event.
 */
export const TONE_BAND_MARGIN = "0px 0px -88% 0px";
