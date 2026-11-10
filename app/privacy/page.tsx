import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Privacy policy", robots: { index: false } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" status="Placeholder. The final policy must be written and reviewed before launch.">
      <p>
        This page will explain what personal data NeuroAdvancements collects, why it is collected, how long it is
        kept, and how to ask for it to be corrected or deleted.
      </p>
      <h2 className="heading-6">What the site does today</h2>
      <p>
        The signup forms ask for an email address only. They are not yet connected to a mailing service, so no
        address is stored. The site does not ask for medical information.
      </p>
      <h2 className="heading-6">Still to be supplied</h2>
      <p>{"{{data controller and contact address}}"}</p>
      <p>{"{{mailing provider and analytics, if any}}"}</p>
      <p>{"{{jurisdiction and applicable privacy law}}"}</p>
    </LegalPage>
  );
}
