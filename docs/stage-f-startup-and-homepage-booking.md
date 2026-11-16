# Stage F: brain startup and booking on the homepage

Status: implemented, uncommitted, awaiting review. Stage E is committed as `ef75a81`.

This supersedes the booking page described in `stage-e-homepage-booking.md`: the calendar now lives on the homepage and `/consultations/book` redirects to it.

## Part 1: brain startup

### Root cause

Nothing about the model's size. Three things stacked:

1. **A serial chain gated on hydration.** HTML, then the page script, then the component mounting, then the 3D code (1 MB, 262 KB compressed), then the model. Each waited for the one before.
2. **Nothing shown in the meantime** except a pale placeholder, followed by a 0.7 second fade and a 1.5 second entry turn once the scene finally arrived.
3. **Development overhead.** In `npm run dev` the 3D code is compiled on demand when first requested, which added well over a second. That is the mode the recording was made in.

A fourth cost showed up once the chain was fixed: reading shader status forced the browser to finish compiling shaders on the main thread, about 400 ms on the first draw.

### Measurements

Chrome, visible tab, 1920 px wide, localhost, same machine. Times from navigation start.

| | Before | After |
|---|---|---|
| **Production: brain visible** | about 1.3 s (first frame 0.62 s, then a 0.7 s fade) | 0.05 to 0.14 s (the still is the largest contentful paint) |
| **Production: first live 3D frame** | 0.62 s | 0.49 and 0.57 s |
| **Production, cold cache after a new build: first live 3D frame** | not measured | 1.70 s (still at 0.10 s) |
| **Development: brain visible** | about 3.9 s | 0.34 s |
| **Development: first live 3D frame** | 3.17 s | 0.57 s |
| Model download starts | 380 to 420 ms, after the 3D code | 20 to 41 ms, with the HTML |
| Model requests | 1 | 1 (the preload is reused, not duplicated) |
| First draw (shaders, upload, draw) | about 370 to 400 ms | 35 to 120 ms |
| Calendly requests during startup | not applicable | 0 |

Honest reading: in production the **live** 3D arrives only slightly sooner on this machine, and run to run variation is as large as the gain. The decisive change is that a brain is on screen from the first paint. The loading order changes should matter more on a real network than on localhost, which was not measured.

### How the handoff works

- `public/models/stills/hero.webp` is in the server rendered HTML, preloaded with high priority and served as a static file.
- It is placed with the same rules the 3D scene uses to place the model, for wide, tablet, and phone layouts, including the size caps.
- The canvas stays at zero opacity until the scene reports that a **real frame has been drawn**, then fades in over 0.3 s directly on top of the still. The still is removed after the fade.
- The entry turn and scale up were removed, so the live brain starts in exactly the pose of the still.
- The still was recaptured from the current renderer. The previous capture had been taken mid entry animation and was about 3% small and a few degrees off.
- If the visitor scrolls before the scene is live, the still hides, because it is only correct at the cover.
- Without WebGL the same still simply stays.

### Loading changes

- The model is preloaded from the HTML (`react-dom` `preload`, as fetch), in parallel with the scripts.
- The 3D code starts downloading when its module is evaluated, not when the component mounts.
- The decorative activity layer waits for the first frame and an idle moment.
- The depth pass uses a minimal shader instead of a built in material.
- Shader status checks are skipped in production.
- No change to geometry, shader appearance, camera work, callouts, reduced motion, or the fallback stills.

A bug found and fixed on the way: the new depth shader computed position in a different order from the shell, which changed depth by rounding error and left white specks on the brain. Both now use the same expression.

Timing marks remain in the code (`na:stage-mounted`, `na:canvas-created`, `na:model-ready`, `na:frame-start`, `na:first-frame`, `na:live-visible`). Read them with `performance.getEntriesByType("mark")`.

## Part 2: booking on the homepage

- **Location:** a full width section, `#book-consultation`, after the newsletter and directly before the footer.
- **Calendar width:** the full page grid (1118 px at 1440), which lets Calendly use its widest layout.
- **Notices:** emergencies, and where the information goes, sit beneath the calendar with links to the privacy policy and medical disclaimer.
- **Links:** navbar and mobile menu, the consultations section button, and the footer all point at the section. On the homepage they are plain `#book-consultation` anchors, so the browser scrolls in place. From other pages they go to `/#book-consultation`.
- **Scroll position:** handled by `scroll-margin-top`, not a calculated offset. Smooth scrolling comes from CSS and is off under reduced motion.
- **Focus:** arriving on the booking address moves focus to the section heading.
- **Old route:** `/consultations/book` returns a 307 redirect to `/#book-consultation`. The page itself is gone, so there is one calendar, not two.

### Lazy start

`components/consultations/lazy-calendly.tsx` holds the calendar back. It starts when either:

- the page is opened on, or navigates to, `#book-consultation`, or
- the section comes within about two screens of the viewport.

Until then a calendar shaped skeleton holds the space, and Calendly's script is not requested. Once started the calendar stays mounted: scrolling away and back, or using back and forward, keeps the same frame.

When a page is opened directly on the booking address, the jump to the section is repeated once after the scroll story has set itself up, as an instant jump. Without this the browser's own jump could be undone.

### Safeguards kept

`NEXT_PUBLIC_BOOKING_ENABLED` still decides everything. With it off, the section shows "Not yet open", Calendly is never loaded, and the built HTML contains no Calendly address.

## Validation

| Check | Result |
|---|---|
| Typecheck, production build | Pass |
| Still at first paint, then handoff | Confirmed at 1440 and 390 px. Still and live brain coincide. Still removed after handoff. |
| Navbar button on homepage | Stays on the page, heading lands 148 px below the navbar, focus on heading, calendar loads |
| Direct `/#book-consultation`, and `/consultations/book` | Both land on the section with the calendar loaded |
| Link from a NeuroBytes page | Lands on the section |
| Back and forward | Return to the section with the same calendar frame |
| Calendly | One script, one frame. Sized by Calendly: 832 to 920 px tall. Real availability shown. |
| 1440, 768, 390 px | No horizontal overflow. Frame 1118, 671, 340 px wide. |
| Booking off | "Not yet open", no Calendly address in the HTML |
| Console | No errors from application code |

Not tested: 375 px, the consultations section button and footer link by clicking (their addresses were checked), the calendar's error and retry state, keyboard activation of the booking links, the anatomy scroll after these changes beyond the cover, throttled or real networks, physical phones, and screen readers. **No booking was made.**

## Remaining limitations

- Live 3D still takes about half a second warm and well over a second on a cold cache. The still covers that gap; it does not remove it.
- Startup was measured on one fast desktop over localhost.
- The cover still is one image for all screens (94 KB, 1000 px wide), so it is slightly soft on very large displays until the live scene takes over.
- The activity traces appear a moment after the live scene, since they now load last.
