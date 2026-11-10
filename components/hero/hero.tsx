import type { CSSProperties, Ref } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Chapter 1 of the brain story, composed like a magazine cover.
 *
 * The brain is the image: the persistent 3D stage renders it large and centred
 * in the upper part of the screen. Copy sits along the bottom edge, headline to
 * the left and the supporting line with its action to the right, so nothing
 * competes with the model and nothing overlaps it.
 */
export function Hero({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="flex min-h-svh flex-col justify-end">
      <div className="shell pb-8 lg:pb-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h1 className="heading-4 hero-ink pb-1 md:heading-2 lg:col-span-7">
            <span className="hero-in block" style={delay(150)}>
              Understanding <span className="whitespace-nowrap">the brain.</span>
            </span>
            <span className="hero-in block" style={delay(270)}>
              Exploring <span className="whitespace-nowrap">what&rsquo;s next.</span>
            </span>
          </h1>

          <div className="hero-in flex max-w-[680px] flex-col items-start gap-4 lg:col-span-4 lg:col-start-9" style={delay(420)}>
            <p className="body-3 story-body">
              Discover neuroscience, emerging neurotechnology, and the ideas shaping our understanding of the human
              brain.
            </p>
            <ButtonLink href="/#neurobytes">
              Explore NeuroBytes
              <ArrowRight aria-hidden="true" weight="bold" className="size-4" />
            </ButtonLink>
          </div>
        </div>

        {/* Scroll invitation: a rule that doubles as the baseline of the cover. */}
        <div className="hero-in mt-8 hidden items-center gap-4 lg:flex" style={delay(600)}>
          <span aria-hidden="true" className="story-rule h-px flex-1" />
          <a href="#inside-the-brain" className="rounded-lg caption-1 story-faint transition-colors motion-hover hover:text-navy">
            Scroll to look inside
          </a>
        </div>
      </div>
    </div>
  );
}
