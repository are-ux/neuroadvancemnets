import { Plate } from "@/components/ui/plates";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { featuredArticle, supportingArticles, type Article } from "@/lib/content/editorial";

/** Byline row. Unknown values render as labelled placeholders, never as invented facts. */
function Meta({ article }: { article: Article }) {
  return (
    <dl className="flex flex-col gap-1 caption-2 text-slate/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
      <div>
        <dt className="sr-only">Author</dt>
        <dd className="caption-1 text-navy">{article.author}</dd>
      </div>
      <div className="flex items-center gap-3 whitespace-nowrap">
        <div>
          <dt className="sr-only">Published</dt>
          <dd>{article.publishedAt ? <time dateTime={article.publishedAt}>{article.publishedAt}</time> : "Date pending"}</dd>
        </div>
        <span aria-hidden="true" className="size-1 rounded-full bg-navy/30" />
        <div>
          <dt className="sr-only">Reading time</dt>
          <dd>{article.readingMinutes ? `${article.readingMinutes} min read` : "Read time pending"}</dd>
        </div>
      </div>
    </dl>
  );
}

function Category({ children }: { children: string }) {
  return <p className="caption-3 text-slate">{children}</p>;
}

export function WeeklyEdit() {
  return (
    <section id="weekly-edit" aria-labelledby="weekly-edit-title" className="bg-white py-20 lg:py-24">
      <div className="shell">
        {/* Masthead */}
        <Reveal>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4">
              <SectionLabel>A weekly editorial</SectionLabel>
              <h2 id="weekly-edit-title" className="heading-2 text-navy lg:heading-1">
                The Weekly Edit
              </h2>
            </div>
            <p className="max-w-sm body-3 text-slate">
              One considered read each week on the advances in neurology that matter, from around the world.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-1 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:gap-4 border border-navy/10 bg-soft px-3 py-2">
            <p className="caption-1 text-navy">Preview edition</p>
            <p className="caption-2 text-slate">Demonstration content. These are not published articles.</p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-12">
          {/* Featured article */}
          <Reveal as="article" className="flex flex-col gap-6 lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl bg-navy text-ice [--plate-bg:#001A38]">
              <Plate id={featuredArticle.plate} className="aspect-[4/3] w-full" />
              <span className="absolute left-4 top-4 rounded-lg bg-white px-2 py-1 caption-3 text-navy">
                Thumbnail placeholder
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <Category>{featuredArticle.category}</Category>
              <h3 className="heading-4 text-navy lg:heading-3">{featuredArticle.title}</h3>
              <p className="max-w-[680px] body-3 text-slate lg:title-2">{featuredArticle.dek}</p>
              <Meta article={featuredArticle} />
            </div>
          </Reveal>

          {/* Supporting articles, set as an index rather than a card grid */}
          <div className="lg:col-span-5">
            <p className="caption-1 text-slate">Also in this edition</p>
            <ol className="mt-4 flex flex-col">
              {supportingArticles.map((article, i) => (
                <Reveal as="li" key={article.id} delay={i * 90}>
                  <div aria-hidden="true" className="h-px bg-navy/10" />
                  <article className="flex gap-4 py-6">
                    <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-ice text-navy [--plate-bg:#DDE8F1]">
                      <Plate id={article.plate} className="size-full scale-150" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Category>{article.category}</Category>
                      <h3 className="title-1 text-navy">{article.title}</h3>
                      <p className="body-6 text-slate">{article.dek}</p>
                      <Meta article={article} />
                    </div>
                  </article>
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
