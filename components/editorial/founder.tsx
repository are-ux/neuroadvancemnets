import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";

const aims = [
  { title: "Explain", detail: "Clear accounts of how the brain works, written for readers without a medical background." },
  { title: "Examine", detail: "Close reading of new research and neurotechnology, including what is still unknown." },
  { title: "Converse", detail: "Conversations with the people whose work is moving neuroscience forward." },
];

/**
 * Founder introduction, composed like a magazine profile: a tall portrait, a
 * name set large, and a short account in her own field's plain terms.
 * Copy is limited to what has been supplied. No qualifications, registrations,
 * affiliations, or achievements are stated beyond the brief.
 */
export function Founder() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-ice py-20 lg:py-24">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Portrait placeholder: framed and captioned like a plate, so it reads as intended, not missing. */}
        <Reveal className="lg:col-span-5">
          <figure className="flex flex-col gap-3">
            <div
              role="img"
              aria-label="Portrait placeholder. A photograph of Amna Noor will appear here."
              className="relative flex aspect-[4/5] items-end overflow-hidden rounded-3xl bg-soft p-6"
            >
              <span aria-hidden="true" className="absolute inset-3 rounded-2xl border border-navy/10" />
              <span aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 heading-1 text-mist">
                AN
              </span>
              <span className="relative caption-1 text-slate">Portrait to follow</span>
            </div>
            <figcaption className="caption-2 text-slate">Amna Noor, founder of NeuroAdvancements.</figcaption>
          </figure>
        </Reveal>

        <div className="flex flex-col gap-10 lg:col-span-6 lg:col-start-7 lg:justify-center">
          <Reveal className="flex flex-col gap-4">
            <SectionLabel>Meet the founder</SectionLabel>
            <h2 id="about-title" className="heading-2 text-navy lg:heading-1">
              Amna Noor
            </h2>
            <p className="max-w-[680px] title-1 text-navy">
              A physician approaching the completion of her neurology training, with a conviction that neurology
              should be understandable to anyone curious enough to ask.
            </p>
            <p className="max-w-[680px] body-3 text-slate">
              Amna started NeuroAdvancements to share what fascinates her about the brain, and to give readers a
              place where neurological knowledge is accessible, engaging, and worth trusting. It begins as a home for
              education, with room to grow into a wider conversation about where neuroscience is heading.
            </p>
          </Reveal>

          <Reveal>
            <p className="caption-1 text-slate">What she is building here</p>
            <ol className="mt-3 flex flex-col">
              {aims.map((aim, i) => (
                <li key={aim.title}>
                  <div aria-hidden="true" className="h-px bg-navy/15" />
                  <div className="grid grid-cols-[32px_1fr] gap-x-4 gap-y-1 py-4 sm:grid-cols-[32px_112px_1fr]">
                    <span className="caption-1 tabular-nums text-slate">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="title-3 text-navy">{aim.title}</h3>
                    <p className="col-start-2 body-6 text-slate sm:col-start-3">{aim.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div aria-hidden="true" className="h-px bg-navy/15" />
          </Reveal>

          <Reveal>
            <Link href="/#weekly-edit" className="group flex items-center gap-2 self-start rounded-lg button-md text-navy">
              Read about The Weekly Edit
              <ArrowRight aria-hidden="true" weight="bold" className="size-4 transition-transform motion-settle group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
