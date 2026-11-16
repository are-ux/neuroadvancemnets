/**
 * Consultation booking configuration. The single place the scheduling link is defined.
 *
 *   NEXT_PUBLIC_CALENDLY_EVENT_URL  the Calendly event to embed
 *   NEXT_PUBLIC_BOOKING_ENABLED     "true" shows the live calendar. Anything else keeps
 *                                   the booking section in its "not open yet" state.
 *
 * Booking stays off by default. Turn it on for the public site only after professional
 * authorization, privacy arrangements, and the clinical workflow have been confirmed.
 * Nothing about the event (length, price, type) is stated in the site's own copy: the
 * embedded calendar is the source of truth for those details.
 */
/** The id of the booking section on the homepage. Every booking link on the site points at it. */
export const BOOKING_ANCHOR = "book-consultation";

const url = process.env.NEXT_PUBLIC_CALENDLY_EVENT_URL ?? "";
const valid = /^https:\/\/calendly\.com\/[\w-]+(\/[\w-]+)?\/?$/.test(url);

export const booking = {
  /** The Calendly event address, or an empty string when it is missing or malformed. */
  url: valid ? url : "",
  /** True only when booking is switched on and a valid event address is configured. */
  enabled: valid && process.env.NEXT_PUBLIC_BOOKING_ENABLED === "true",
  /** From any page. On the homepage itself, links use the bare anchor so the browser scrolls in place. */
  route: `/#${BOOKING_ANCHOR}`,
} as const;
