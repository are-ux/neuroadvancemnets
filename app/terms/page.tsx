import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Terms", robots: { index: false } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" status="Placeholder. The final terms must be written and reviewed before launch.">
      <p>
        This page will set out the terms for using NeuroAdvancements, including how its articles, illustrations,
        and podcast may be shared and quoted.
      </p>
      <h2 className="heading-6">Still to be supplied</h2>
      <p>{"{{legal entity and governing law}}"}</p>
      <p>{"{{content licence and attribution rules}}"}</p>
      <p>{"{{consultation terms, once consultations are authorized}}"}</p>
    </LegalPage>
  );
}
