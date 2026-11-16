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
        The email signup forms are closed. They are not connected to a mailing service and do not collect or store
        anything. The site does not ask for medical information.
      </p>
      <h2 className="heading-6">Consultation booking</h2>
      <p>
        The booking section of the homepage embeds a calendar from Calendly, a separate scheduling service. It loads
        only when a visitor reaches or asks for that section. Details entered there go to Calendly and are handled under its privacy policy, and Calendly may
        set cookies. The calendar is for arranging a time only and should not be used to send medical information.
      </p>
      <h2 className="heading-6">Still to be supplied</h2>
      <p>{"{{data controller and contact address}}"}</p>
      <p>{"{{mailing provider and analytics, if any}}"}</p>
      <p>{"{{jurisdiction and applicable privacy law}}"}</p>
    </LegalPage>
  );
}
