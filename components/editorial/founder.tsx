import { UserFocus } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";

const pillars = [
  { title: "Explain", detail: "Clear accounts of how the brain works, written for readers without a medical background." },
  { title: "Examine", detail: "Close reading of new research and neurotechnology, including what is still unknown." },
  { title: "Converse", detail: "Conversations with the people whose work is moving neuroscience forward." },
];

/**
 * Founder introduction. Copy is limited to what has been supplied: no
 * qualifications, titles, or affiliations are stated beyond the brief.
 */
export function Founder() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 lg:py-24">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <Reveal className="lg:col-span-5">
          <figure className="flex flex-col gap-3">
            <div
              role="img"
              aria-label="Portrait placeholder. A photograph of Amna Noor will appear here."
              className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-3xl border border-navy/10 bg-ice text-slate"
            >
              <UserFocus aria-hidden="true" weight="light" className="size-16" />
              <p className="caption-1">Portrait placeholder</p>
            </div>
            <figcaption className="caption-2 text-slate/80">Photograph of Amna Noor to be supplied.</figcaption>
          </figure>
        </Reveal>

        <div className="flex flex-col gap-8 lg:col-span-7">
          <Reveal className="flex flex-col gap-4">
            <SectionLabel>Meet the founder</SectionLabel>
            <h2 id="about-title" className="heading-3 text-navy lg:heading-2">
              Amna Noor
            </h2>
            <p className="max-w-[680px] title-2 text-navy">
              A physician approaching the completion of her neurology training, with a conviction that neurology
              should be understandable to anyone curious enough to ask.
            </p>
            <p className="max-w-[680px] body-3 text-slate">
              Amna started NeuroAdvancements to share what fascinates her about the brain, and to give readers a
              place where neurological knowledge is accessible, engaging, and worth trusting. It is a home for
              education first, with room to grow into a wider conversation about where neuroscience is heading.
            </p>
          </Reveal>

          <ol className="flex flex-col">
            {pillars.map((pillar, i) => (
              <Reveal as="li" key={pillar.title} delay={i * 90}>
                <div aria-hidden="true" className="h-px bg-navy/10" />
                <div className="grid grid-cols-[auto_1fr] gap-x-6 py-4 sm:grid-cols-[48px_160px_1fr]">
                  <span className="caption-1 tabular-nums text-orange">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="title-3 text-navy">{pillar.title}</h3>
                  <p className="col-start-2 body-6 text-slate sm:col-start-3">{pillar.detail}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <ButtonLink href="/#weekly-edit" variant="outline-light">
              Read The Weekly Edit
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
