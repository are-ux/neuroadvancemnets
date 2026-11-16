import { Reveal } from "@/components/ui/reveal";
import { SignupForm } from "@/components/ui/signup-form";

/** Newsletter: one line, one sentence, one field. */
export function Newsletter() {
  return (
    <section id="newsletter" aria-labelledby="newsletter-title" className="py-20 lg:py-24">
      <Reveal className="shell flex flex-col items-center gap-6 text-center">
        <h2 id="newsletter-title" className="max-w-[680px] heading-3 text-navy lg:heading-2">
          A little neuroscience in your inbox.
        </h2>
        <p className="max-w-md body-3 text-slate">
          New NeuroBytes and each edition of The Weekly Edit, sent as they are published. You can unsubscribe at any
          time.
        </p>
        <SignupForm list="newsletter" submitLabel="Subscribe" className="text-left" />
      </Reveal>
    </section>
  );
}
