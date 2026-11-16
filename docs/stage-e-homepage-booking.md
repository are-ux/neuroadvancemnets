# Stage E: editorial homepage and Calendly booking

Status: implemented, uncommitted, awaiting review. Stage D revision 2 is committed as `c259eb0`.

## Stage D finishing

- **Portrait tablets:** the brain is now sized for the tablet's taller band (it was phone sized), and the copy beneath it uses larger type. The gap between the two is roughly halved.
- **Hero fallback still:** recaptured in the paper preset, so without WebGL the cover brain matches the live one.
- No other change to the timeline, shader, geometry, or camera.

## Homepage sections

The six card grid, the bordered panels, and the second 3D canvas are gone. Each section now has its own composition.

| Section | Composition |
|---|---|
| NeuroBytes | One featured subject on a large dark figure plate, with the other five as a numbered index beside it. Each links to its own page. |
| The Weekly Edit | A masthead between rules, a lead story under a wide image, three numbered shorter pieces, and a line inviting readers back each week. |
| About Amna Noor | A tall framed portrait placeholder with her initials, her name set large, a short profile, and three aims. |
| Consultations | A plain statement of status, one action to the booking page, how booking works, and the emergency notice. |
| Podcast | A full width dark passage with a single hairline level line. No animation, no 3D. |
| Newsletter | One heading, one sentence, one field, centred. |
| Footer | Navigation, booking, legal links. Social icons and a contact address appear only when configured. |

Imagery is the site's own: the code drawn figure plates and stills of the brain model. No stock or generated images.

Content rules kept:
- NeuroBytes subjects are marked "in preparation". Their pages say what each piece will cover and are excluded from search indexing.
- Weekly Edit pieces are labelled as a sample layout. Dates and reading times are not shown at all until an article has them.
- The founder copy states nothing beyond the brief.
- No episodes, guests, fees, or appointment lengths are stated anywhere in the site's own copy.

New route: `/neurobytes/[slug]`, one prerendered page per subject.

## Calendly

**Route:** `/consultations/book`. The navigation button, the homepage section, and the footer all lead there.

**Configuration** (`lib/content/booking.ts`, `.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CALENDLY_EVENT_URL` | The event to embed. Development value: `https://calendly.com/neuroadvancements/30min`. |
| `NEXT_PUBLIC_BOOKING_ENABLED` | `true` shows the live calendar. Anything else shows the "not yet open" state. |

Booking is **off unless switched on**. `.env.local` turns it on for development. A production build without the flag prerenders the closed state with no Calendly address in the page.

**Embed** (`components/consultations/calendly-embed.tsx`):
- Uses Calendly's official script and `Calendly.initInlineWidget`. No wrapper library.
- The script is loaded once per page through a shared promise. A failed load clears itself so "Try again" works.
- The widget is initialised once per mount. A cleaned up effect cannot initialise it.
- `resize: true` lets Calendly set the frame height to fit its content, so nothing is cut off and there is no inner scrollbar. A 560px minimum covers the moment before Calendly reports a height.
- Loading state: a calendar shaped skeleton until Calendly's frame announces itself.
- Error state: shown if the script fails or nothing arrives within 15 seconds, with "Try again" and a direct link.
- A direct link to the event on Calendly is always shown under the calendar.
- Time zones, availability, and the booking itself are entirely Calendly's.

**Safeguards on the page:** not for emergencies notice, a statement that details go to Calendly under its privacy policy and that it may set cookies, a request not to enter clinical details, links to the privacy policy and medical disclaimer. The page collects no medical information and adds no forms of its own beyond an email "notify me" field in the closed state.

## What was tested

| Check | Result |
|---|---|
| Typecheck, production build | Pass |
| Build with booking off | Booking page shows "Not yet open". No Calendly address in the HTML. |
| Calendly at 1440, 768, 390 px | Real event loads with real availability. Frame sized by Calendly (832px tall). No horizontal overflow. |
| Duplicate loading | One Calendly script, one frame, in development (which mounts effects twice). |
| Navigation | All four "book" links go to `/consultations/book`. The button is marked as the current page there. |
| Links | Every internal link on the homepage returns 200. None point at `#`. |
| NeuroBytes, Weekly Edit, founder, consultations, podcast, newsletter, footer | Reviewed at 1440 px. NeuroBytes, Weekly Edit, founder, podcast reviewed at 390 px. |
| Anatomy story | Tablet frontal beat reviewed after the sizing change. Desktop and phone unchanged from the Stage D review. |

## Not tested

- **No booking was made.** The calendar was loaded and viewed only. Selecting a slot and submitting was not attempted.
- **Calendly's cookie banner** was left untouched, so the consented state was not seen.
- **Error state** of the embed (blocked script or timeout) was not triggered in a browser. It is implemented but unverified.
- The topic pages were viewed on desktop only.
- Reduced motion and the no WebGL path were not re-run in this stage. The code paths are unchanged apart from the new hero still.
- Physical phones, real touch scrolling, and screen readers remain outstanding, as in Stage D.

## Needs configuration or authorization before launch

1. **Professional authorization** for online consultations, and the clinical workflow behind them.
2. **Privacy arrangements:** Calendly's data handling, a data processing agreement where required, and the final privacy policy text.
3. **Cookie consent:** the booking page loads a third party that may set cookies. Decide whether your jurisdiction needs consent before the calendar loads.
4. **The event itself:** it currently reads "30 Minute Meeting" with web conferencing, which looks like Calendly's default. Name, description, questions, and any fee are set in Calendly, not in this code.
5. `NEXT_PUBLIC_BOOKING_ENABLED=true` and `NEXT_PUBLIC_CALENDLY_EVENT_URL` in the production environment, only after 1 to 3.
6. A mailing provider for the signup forms, social profile addresses, and a contact email (`lib/content/site.ts`).
7. A photograph of Amna Noor.

## Observations

- The podcast's 3D soundwave canvas was removed, so the page now runs one WebGL context instead of two.
- Calendly's script and frame load only on the booking page.
- Calendly's frame logs a report only content security notice about reCAPTCHA. It comes from Calendly's side and does not affect the calendar.

## Remaining limitations

- The Weekly Edit and NeuroBytes have no real articles. Their designs are proven only against sample copy.
- The portrait is a placeholder.
- Weekly Edit pieces are not links, because there is nothing to read yet. The section has one link, to the newsletter.
- On a portrait tablet the frontal label sits close to the top of the brain.
