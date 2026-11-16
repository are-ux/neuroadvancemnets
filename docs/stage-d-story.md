# Stage D: cinematic scroll story

Status: revision 2, uncommitted, awaiting approval. Stage C is committed as `d4ca8bf`.

Before and after screenshots and a stepped scroll recording are in `docs/review/`.

## Why revision 1 was not good enough

Reviewed at intermediate scroll positions, not only at the composed stops:

- **Scroll spent on moving panels.** Copy sat in ordinary sections that scrolled past the pinned brain. Between chapters, one panel was leaving under the navigation bar while the next was half way in. Roughly a third of the scroll showed cut off copy or the brain alone on a dark screen (`before-3`, `before-5`).
- **Too long.** 560svh for about 120 words.
- **Timid typography.** Lobe names were 16px list items inside a panel, so every chapter read as "small text beside a brain".
- **Repeated layout.** Two chapters used the same two item list.
- **Cover and first chapter copy overlapped** during the tone change, and the cover copy scrolled up into the brain while it faded.
- **Dead exit.** After the last chapter a stretch of empty dark page scrolled by before the next section (`before-8`).
- **Frontal label** sat close under the navigation bar.

## What changed

- **One pinned stage.** After the cover, a single frame pins and stays pinned for the whole anatomy story. Copy for all six beats is stacked in that frame and changes in place. No scroll is spent moving copy on or off screen.
- **Shorter.** Desktop 359svh (was 560, down 36%). Phone 332svh (was 544, down 39%).
- **Larger type.** Each lobe is a 60px title on desktop with a tagline beneath it. The overview title is 48px.
- **Distinct compositions.** Overview: copy left, lateral brain right, four lobes named. Thought and memory: brain left, copy right. Perception and sensation: closer brain right, copy left. Complete: brain centred, statement beneath.
- **Orientation.** The two lobe chapters show both lobe names above the title with the current one underlined.
- **Copy never crosses the brain.** Copy leaves shortly after its beat departs and the next arrives shortly before its beat does. In between the brain travels alone, briefly.
- **Cover copy** now fades within the first 13% of a screen of scroll, before it can reach the brain.
- **Exit.** The final composition scrolls away with the next section rising directly beneath it.
- **Frontal label** and all others keep at least 132px from the top on desktop.
- **Chapter links** (the rail and `#thought-and-memory` style addresses) land exactly on their beat.

The brain shader, geometry, callout anchors, and activity layer are unchanged from revision 1.

## Timeline

One GSAP timeline scrubbed by ScrollTrigger (0.6s catch up). Its time axis is scroll distance.

| Beat | Chapter | Arrives at (desktop, 900px tall) |
|---|---|---|
| Cover | | 0 |
| Overview | 1. The human brain | 0.66 screens |
| Frontal | 2. Thought and memory | 1.05 |
| Temporal | 2. Thought and memory | 1.40 |
| Parietal | 3. Perception and sensation | 1.75 |
| Occipital | 3. Perception and sensation | 2.10 |
| Complete | 4. The complete picture | 2.45, held to 2.59 |

- Each anatomy beat gets one step: 35svh on desktop, 30svh on phones. It holds for the first 30% and the camera moves for the remaining 70%.
- The frame pins 0.7 screens into the page, a little before the cover has fully left, so the move to the overview starts sooner.
- The page dims from paper to night between 0.2 and 0.66 screens.
- Scheduling lives in `lib/animations/story-timeline.ts`, shots and copy in `lib/content/brain-chapters.ts`.

## Fallbacks

- **No WebGL:** seven stills, one per beat, captured from the real renderer (`public/models/stills/`, 100 to 125 KB each, 816 KB in total). The still for the current beat is shown in that beat's place in the layout, with the lit lobe named in its caption. A still is requested only when its beat is reached.
- **Reduced motion:** the brain keeps one lateral orientation and never turns or moves in. It takes each chapter's place in the layout, and emphasis, outlines, labels, and copy change. Copy fades without sliding.
- **No JavaScript:** the copy for every beat is laid out as ordinary stacked text.
- QA switches: `?motion=reduce` and `?webgl=off`.

## Validation (revision 2)

| Check | Result |
|---|---|
| Desktop 1440 x 900 | All seven beats and the in between positions reviewed. Copy and brain never overlap. |
| Tablet 768 x 1024 | Overview, parietal, and occipital reviewed. No overflow. |
| Phone 390 x 844 | Overview, frontal, temporal, parietal, complete reviewed. No overflow. |
| No WebGL | Chapter stills appear in place with captions. |
| Reduced motion | Chapter link lands on its beat. Layout reviewed in revision 1 and unchanged in principle. |
| Keyboard | Tab order: navigation, cover action, scroll link, chapter rail. Focus ring visible. |
| Headings | h1 cover, h2 "Inside the human brain", h3 per beat, in reading order. No beat copy is hidden from assistive technology. |
| Typecheck and production build | Pass. |
| Console | No errors from application code. |

## Needs a physical device

- Real touch scrolling and momentum on iOS and Android, including the address bar collapsing while the frame is pinned.
- Frame rate on mid range phones. Only a fast desktop has been measured (revision 1: median 6.9 ms per frame, none over 33 ms).
- A screen reader pass (VoiceOver, NVDA, TalkBack). Structure was checked, not the spoken experience.

## Remaining limitations

- On a portrait tablet there is spare space between the brain and the copy. The layout is the phone layout scaled up.
- The stills were captured in the night preset, so on the paper cover the fallback brain is bluer than the live one.
- Callouts are hidden from assistive technology because the copy names each lobe.
- The scroll recording is a stepped sequence of 14 captures, not continuous video. This environment could not record live video.
- Cerebellum and brainstem are still absent (see `stage-c-brain.md`).
