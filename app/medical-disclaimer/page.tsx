import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Medical disclaimer", robots: { index: false } };

export default function MedicalDisclaimerPage() {
  return (
    <LegalPage title="Medical disclaimer" status="Draft for professional and legal review before launch.">
      <p>
        NeuroAdvancements publishes educational content about neuroscience and neurology. It is general information
        and is not medical advice, diagnosis, or treatment.
      </p>
      <p>
        Reading this site does not create a relationship between a doctor and a patient. Do not delay seeking care,
        or disregard advice from your own clinician, because of something you read here.
      </p>
      <h2 className="heading-6">Emergencies</h2>
      <p>
        This website does not provide emergency care. If you think you may be having a medical emergency, call your
        local emergency number or go to the nearest emergency department now.
      </p>
      <h2 className="heading-6">Consultations</h2>
      <p>
        Online consultations are not currently offered. This page will be updated with the terms that apply once
        they are available.
      </p>
    </LegalPage>
  );
}
