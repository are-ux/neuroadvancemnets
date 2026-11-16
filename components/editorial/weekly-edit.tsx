import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { featuredArticle, supportingArticles, type Article } from "@/lib/content/editorial";

/** Byline. Date and reading time appear only once an article has them: nothing is shown in their place. */
function Byline({ article }: { article: Article }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 caption-2 text-slate">
      <span className="caption-1 text-navy">By {article.author}</span>
      {article.publishedAt && <time dateTime={article.publishedAt}>{article.publishedAt}</time>}
      {article.readingMinutes && <span>{article.readingMinutes} min read</span>}
    </p>
  );
}

/**
 * The Weekly Edit, set like the front of a magazine: a masthead between rules,
 * one lead story with a full width image, and a numbered run of shorter pieces.
 * The image is a still of the site's own brain model, so the editorial pages and
 * the anatomy story share one visual world.
 */
export function WeeklyEdit() {
  return (
    <section id="weekly-edit" aria-labelledby="weekly-edit-title" className="bg-white py-20 lg:py-24">
      <div className="shell">
        {/* Masthead */}
        <Reveal>
          <div aria-hidden="true" className="h-0.5 bg-navy" />
          <div className="flex flex-col gap-4 py-6 lg:flex-row lg:items-end lg:justify-between lg:py-8">
            <h2 id="weekly-edit-title" className="heading-2 text-navy md:heading-1">
              The Weekly Edit
            </h2>
            <p className="max-w-sm body-3 text-slate">
              One carefully researched article every week on the developments in neurology that matter, from around
              the world.
            </p>
          </div>
          <div aria-hidden="true" className="h-px bg-navy/15" />
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3 caption-1 text-slate">
            <p>Preview edition</p>
            <p>Sample layout. These are not published articles.</p>
          </div>
          <div aria-hidden="true" className="h-px bg-navy/15" />
        </Reveal>

        {/* Lead story */}
        <Reveal as="article" className="mt-10 lg:mt-12">
          <figure className="relative overflow-hidden rounded-3xl bg-night">
            <Image
              src="/models/stills/occipital.webp"
              alt="The cerebral cortex seen from behind, with the occipital lobe lit."
              width={1000}
              height={750}
              sizes="(min-width: 1024px) 1136px, 100vw"
              className="mx-auto aspect-[4/3] w-full max-w-3xl object-contain [mask-image:radial-gradient(closest-side,black_72%,transparent)] md:aspect-[21/9] md:scale-150"
            />
            <figcaption className="absolute bottom-4 left-4 caption-4 text-mist md:bottom-6 md:left-6">
              Illustration: the NeuroAdvancements brain model
            </figcaption>
          </figure>

          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col gap-4 lg:col-span-7">
              <p className="caption-1 text-slate">{featuredArticle.category}</p>
              <h3 className="heading-3 text-navy lg:heading-2">{featuredArticle.title}</h3>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9 lg:pt-8">
              <p className="body-3 text-slate lg:title-2">{featuredArticle.dek}</p>
              <Byline article={featuredArticle} />
            </div>
          </div>
        </Reveal>

        {/* Shorter pieces */}
        <ol className="mt-12 grid gap-x-8 md:grid-cols-3 lg:mt-16">
          {supportingArticles.map((article, i) => (
            <Reveal as="li" key={article.id} delay={i * 90}>
              <div aria-hidden="true" className="h-px bg-navy/15" />
              <article className="flex flex-col gap-3 py-6">
                <p className="flex items-baseline justify-between gap-4">
                  <span className="heading-4 tabular-nums text-mist">{String(i + 2).padStart(2, "0")}</span>
                  <span className="caption-1 text-slate">{article.category}</span>
                </p>
                <h3 className="heading-6 text-navy">{article.title}</h3>
                <p className="body-6 text-slate">{article.dek}</p>
                <Byline article={article} />
              </article>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <div aria-hidden="true" className="h-px bg-navy/15" />
          <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="title-2 text-navy">A new edition every week, once publishing begins.</p>
            <Link href="/#newsletter" className="group flex items-center gap-2 rounded-lg button-md text-navy">
              Get the first edition by email
              <ArrowRight aria-hidden="true" weight="bold" className="size-4 transition-transform motion-settle group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
