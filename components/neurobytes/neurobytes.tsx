import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Plate } from "@/components/ui/plates";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { neuroByteTopics } from "@/lib/content/editorial";

/**
 * NeuroBytes: one featured subject set large on a dark figure plate, with the
 * rest as a numbered index beside it. No cards: hierarchy comes from scale,
 * rules, and the figures themselves.
 */
export function NeuroBytes() {
  const [featured, ...rest] = neuroByteTopics;

  return (
    <section id="neurobytes" aria-labelledby="neurobytes-title" className="py-20 lg:py-24">
      <div className="shell">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <SectionLabel>NeuroBytes</SectionLabel>
            <h2 id="neurobytes-title" className="heading-3 text-navy lg:heading-1">
              Big ideas about the brain, in pieces you can finish.
            </h2>
          </div>
          <p className="max-w-sm body-3 text-slate lg:col-span-4 lg:col-start-9">
            Short, careful explainers on neuroscience and neurotechnology. These six subjects come first. Each is in
            preparation and has its own page.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          {/* Featured subject */}
          <Reveal as="article" className="lg:col-span-7">
            <Link href={`/neurobytes/${featured.slug}`} className="group flex flex-col gap-6 rounded-3xl">
              <div className="relative overflow-hidden rounded-3xl bg-night text-ice [--plate-bg:#101A26]">
                <Plate
                  id={featured.plate}
                  className="aspect-[4/3] w-full p-6 transition-transform motion-settle group-hover:scale-[1.03] lg:p-10"
                />
                <span className="absolute left-6 top-6 caption-3 text-mist">{featured.figure}</span>
                <span className="absolute right-6 top-6 caption-3 text-mist">Featured</span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="caption-1 text-slate">{featured.category}</p>
                <h3 className="heading-3 text-navy lg:heading-2">{featured.title}</h3>
                <p className="max-w-[680px] body-3 text-slate lg:title-2">{featured.summary}</p>
                <p className="mt-1 flex items-center gap-2 button-md text-navy">
                  About this NeuroByte
                  <ArrowRight aria-hidden="true" weight="bold" className="size-4 transition-transform motion-settle group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          </Reveal>

          {/* The other five, as an index */}
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="caption-1 text-slate">Also in preparation</p>
            <ol className="mt-4 flex flex-col">
              {rest.map((topic, i) => (
                <Reveal as="li" key={topic.slug} delay={i * 70}>
                  <div aria-hidden="true" className="h-px bg-navy/10" />
                  <Link href={`/neurobytes/${topic.slug}`} className="group flex items-center gap-4 rounded-lg py-4">
                    <span className="size-16 shrink-0 overflow-hidden rounded-2xl bg-ice text-navy [--plate-bg:#E9EDF0]">
                      <Plate id={topic.plate} className="size-full scale-125 transition-transform motion-settle group-hover:scale-150" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="caption-4 text-slate">
                        {topic.figure} · {topic.category}
                      </span>
                      <span className="title-2 text-navy">{topic.title}</span>
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-mist transition-[color,transform] motion-settle group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy"
                    />
                  </Link>
                </Reveal>
              ))}
            </ol>
            <div aria-hidden="true" className="h-px bg-navy/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
