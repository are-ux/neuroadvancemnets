import { Reveal } from "@/components/ui/reveal";
import { SignupForm } from "@/components/ui/signup-form";

/**
 * A quiet audio motif: one line of hairline strokes whose heights follow a slow
 * envelope, like a level meter at rest. Drawn once, never animated.
 */
function LevelLine() {
  const count = 96;
  const bars = Array.from({ length: count }, (_, i) => {
    const x = i / (count - 1);
    const envelope = Math.sin(x * Math.PI) ** 1.2;
    const detail = 0.5 + 0.3 * Math.sin(x * 21 + 0.6) + 0.2 * Math.sin(x * 53 + 2.1);
    return Math.max(0.06, envelope * Math.max(0.15, detail));
  });
  return (
    <svg viewBox={`0 0 ${count * 6} 120`} preserveAspectRatio="none" aria-hidden="true" focusable="false" className="h-24 w-full text-mist lg:h-32">
      {bars.map((h, i) => (
        <line
          key={i}
          x1={i * 6 + 3}
          x2={i * 6 + 3}
          y1={Math.round((60 - h * 54) * 10) / 10}
          y2={Math.round((60 + h * 54) * 10) / 10}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          opacity={i % 8 === 0 ? 0.9 : 0.4}
        />
      ))}
    </svg>
  );
}

/**
 * NeuroConversations: the second and last dark passage on the page, echoing the
 * anatomy story. The podcast has not launched, so there are no episodes or guests here.
 */
export function Podcast() {
  return (
    <section id="podcast" data-nav-tone="dark" aria-labelledby="podcast-title" className="on-dark bg-night py-20 text-white lg:py-24">
      <div className="shell">
        <Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <p className="flex items-center gap-3 caption-1 text-mist">
              <span aria-hidden="true" className="h-px w-6 bg-white/40" />
              NeuroConversations, a podcast
              <span className="rounded-lg border border-white/20 px-2 py-1 caption-3 text-white">Coming soon</span>
            </p>
            <h2 id="podcast-title" className="heading-3 text-white lg:heading-1">
              Conversations worth thinking about.
            </h2>
          </div>
          <p className="max-w-sm body-3 text-ice lg:col-span-4 lg:col-start-9 lg:title-2">
            Exploring neuroscience through ideas, discoveries, and conversations with fascinating minds.
          </p>
        </Reveal>

        <Reveal className="mt-10 lg:mt-12">
          <LevelLine />
        </Reveal>

        <Reveal className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-12 lg:gap-8">
          <p className="title-2 text-white lg:col-span-5">Hear about the first episode.</p>
          <div className="lg:col-span-6 lg:col-start-7">
            <SignupForm list="podcast" submitLabel="Notify me" tone="dark" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
