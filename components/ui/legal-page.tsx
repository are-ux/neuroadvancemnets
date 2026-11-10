import type { ReactNode } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";

/** Shared frame for the legal pages. Draft status is stated on the page itself. */
export function LegalPage({ title, status, children }: { title: string; status: string; children: ReactNode }) {
  return (
    <article className="shell pb-24 pt-32">
      <div className="mx-auto flex max-w-[680px] flex-col gap-6">
        <ButtonLink href="/" variant="outline-light" size="sm" className="self-start">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to home
        </ButtonLink>
        <h1 className="heading-3 text-navy lg:heading-2">{title}</h1>
        <p className="rounded-lg border border-navy/10 bg-white px-3 py-2 caption-1 text-slate">{status}</p>
        <div className="flex flex-col gap-4 body-3 text-slate [&_h2]:mt-4 [&_h2]:text-navy">{children}</div>
      </div>
    </article>
  );
}
