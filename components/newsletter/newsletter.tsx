import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { SignupForm } from "@/components/ui/signup-form";

export function Newsletter() {
  return (
    <section id="newsletter" aria-labelledby="newsletter-title" className="py-20 lg:py-24">
      <Reveal className="shell grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <SectionLabel>Newsletter</SectionLabel>
          <h2 id="newsletter-title" className="max-w-[680px] heading-3 text-navy lg:heading-2">
            A little neuroscience in your inbox.
          </h2>
          <p className="max-w-[680px] body-3 text-slate">
            New NeuroBytes and each edition of The Weekly Edit, sent as they are published. You can unsubscribe at
            any time.
          </p>
        </div>
        <div className="lg:col-span-5">
          <SignupForm list="newsletter" submitLabel="Subscribe" />
        </div>
      </Reveal>
    </section>
  );
}
