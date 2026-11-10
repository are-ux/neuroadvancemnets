import type { Ref } from "react";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";

/**
 * Chapter 1 of the brain story. The 3D brain is rendered by the persistent
 * stage behind this copy, so this component is text only.
 */
export function Hero({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="flex min-h-svh items-end lg:items-center">
      <div className="shell pb-10 lg:pb-0">
        <div className="flex max-w-[680px] flex-col items-start gap-4 lg:w-1/2 lg:gap-6">
          <h1 className="heading-4 hero-ink-dark pb-1 md:heading-2 xl:heading-1">
            Understanding <span className="whitespace-nowrap">the brain.</span>
            <br />
            Exploring <span className="whitespace-nowrap">what&rsquo;s next.</span>
          </h1>
          <p className="max-w-[680px] body-3 text-ice lg:title-2">
            Discover neuroscience, emerging neurotechnology, and the ideas shaping our understanding of the human
            brain.
          </p>
          <ButtonLink href="/#neurobytes" className="mt-2">
            Explore NeuroBytes
            <ArrowRight aria-hidden="true" weight="bold" className="size-4" />
          </ButtonLink>
        </div>
        <p className="mt-16 hidden items-center gap-2 caption-1 text-ice/70 lg:flex">
          <ArrowDown aria-hidden="true" className="size-4" />
          Scroll to explore the brain
        </p>
      </div>
    </div>
  );
}
