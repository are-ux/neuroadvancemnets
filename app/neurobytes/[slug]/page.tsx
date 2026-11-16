import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { Plate } from "@/components/ui/plates";
import { SignupForm } from "@/components/ui/signup-form";
import { neuroByteTopics } from "@/lib/content/editorial";

/**
 * Every topic page is prerendered from generateStaticParams, so the route does not need a
 * streaming shell. This opts it out of the development time instant navigation check.
 */
export const instant = false;

/** One page per NeuroByte subject. Until an article is published, it says what the piece will cover. */
export function generateStaticParams() {
  return neuroByteTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = neuroByteTopics.find((t) => t.slug === slug);
  // In preparation: kept out of search results until there is an article to index.
  return topic ? { title: topic.title, description: topic.summary, robots: { index: false } } : {};
}

export default async function NeuroBytePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = neuroByteTopics.find((t) => t.slug === slug);
  if (!topic) notFound();

  return (
    <article className="shell pb-24 pt-32">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <ButtonLink href="/#neurobytes" variant="outline-light" size="sm" className="self-start">
            <ArrowLeft aria-hidden="true" className="size-4" />
            All NeuroBytes
          </ButtonLink>
          <p className="caption-1 text-slate">
            {topic.figure} · {topic.category}
          </p>
          <h1 className="heading-3 text-navy lg:heading-1">{topic.title}</h1>
          <p className="title-2 text-navy">{topic.summary}</p>
          <p className="rounded-lg border border-navy/10 bg-white px-3 py-2 caption-1 text-slate">
            In preparation. This NeuroByte has not been published yet.
          </p>
          <p className="max-w-[680px] body-3 text-slate">{topic.about}</p>
          <div className="mt-4 flex flex-col gap-2">
            <p className="title-3 text-navy">Hear when it is published</p>
            <SignupForm list="newsletter" submitLabel="Notify me" />
          </div>
        </div>

        <figure className="lg:col-span-6">
          <div className="overflow-hidden rounded-3xl bg-night text-ice [--plate-bg:#101A26]">
            <Plate id={topic.plate} className="aspect-[4/3] w-full p-6 lg:p-10" />
          </div>
          <figcaption className="mt-3 caption-2 text-slate">
            {topic.figure}. Schematic illustration, not a recording or a scan.
          </figcaption>
        </figure>
      </div>
    </article>
  );
}
