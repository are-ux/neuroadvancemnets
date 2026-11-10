/**
 * Design tokens shared with code that cannot read CSS variables (the 3D scenes).
 * The CSS source of truth lives in app/globals.css.
 */
export const colors = {
  navy: "#001A38",
  slate: "#142F4C",
  orange: "#FC6A01",
  orangeDeep: "#C24E00",
  soft: "#F7F9FC",
  ice: "#DDE8F1",
  white: "#FFFFFF",
} as const;

/** Cortex material palette for the 3D brain, derived from the brand colours. */
export const cortex = {
  gyrus: "#E6EEF5",
  sulcus: "#6F8AA6",
  dimGyrus: "#3A5674",
  dimSulcus: "#152C47",
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
