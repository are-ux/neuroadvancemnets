import { Plate } from "@/components/ui/plates";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { neuroByteTopics } from "@/lib/content/editorial";

/** Alternating wide and narrow columns, so the six topics read as a spread rather than a uniform grid. */
const spans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7", "lg:col-span-7", "lg:col-span-5"];

export function NeuroBytes() {
  return (
    <section id="neurobytes" aria-labelledby="neurobytes-title" className="py-20 lg:py-24">
      <div className="shell">
        <Reveal className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex max-w-[680px] flex-col gap-4">
            <SectionLabel>NeuroBytes</SectionLabel>
            <h2 id="neurobytes-title" className="heading-3 text-navy lg:heading-2">
              Big ideas about the brain, in pieces you can finish.
            </h2>
          </div>
          <p className="max-w-sm body-3 text-slate">
            Short, careful explainers on neuroscience and neurotechnology. Six subjects to begin with, each one
            written to be read in a single sitting.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-12 lg:gap-6">
          {neuroByteTopics.map((topic, i) => (
            <Reveal as="li" key={topic.id} delay={(i % 2) * 90} className={spans[i]}>
              <article className="group flex h-full flex-col gap-2 rounded-3xl border border-navy/10 bg-white p-2">
                <div className="relative overflow-hidden rounded-2xl bg-ice text-navy [--plate-bg:#DDE8F1]">
                  <Plate
                    id={topic.plate}
                    className="h-56 w-full transition-transform motion-settle group-hover:scale-[1.03] lg:h-64"
                  />
                  <span className="absolute left-3 top-3 caption-3 text-slate">{topic.figure}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="heading-6 text-navy">{topic.title}</h3>
                  <p className="body-6 text-slate">{topic.summary}</p>
                  <p className="mt-auto flex items-center gap-2 pt-4 caption-4 text-slate/70">
                    <span aria-hidden="true" className="size-1 rounded-full bg-orange" />
                    First articles in preparation
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
