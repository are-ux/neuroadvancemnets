import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="shell flex min-h-svh flex-col items-center justify-center gap-6 py-32 text-center">
      <Image src="/brand/mark.png" alt="" width={512} height={512} className="size-20" />
      <p className="caption-1 text-slate">Error 404</p>
      <h1 className="heading-3 text-navy lg:heading-2">This page could not be found.</h1>
      <p className="max-w-md body-3 text-slate">
        The address may be mistyped, or the page may have moved. The homepage is a good place to start again.
      </p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </section>
  );
}
