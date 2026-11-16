import type { Metadata } from "next";
import { preload } from "react-dom";
import { BrainStory } from "@/components/brain-experience/brain-story";
import { BookConsultation } from "@/components/consultations/book-consultation";
import { Consultations } from "@/components/consultations/consultations";
import { BrandStatement } from "@/components/editorial/brand-statement";
import { Founder } from "@/components/editorial/founder";
import { WeeklyEdit } from "@/components/editorial/weekly-edit";
import { NeuroBytes } from "@/components/neurobytes/neurobytes";
import { Newsletter } from "@/components/newsletter/newsletter";
import { Podcast } from "@/components/podcast/podcast";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  // The brain model is requested with the page, not after the 3D code has loaded and asked for it.
  preload("/models/brain.glb", { as: "fetch", crossOrigin: "anonymous" });

  return (
    <>
      {/* Sections 1 and 2: cinematic hero and the scroll driven anatomy story. */}
      <BrainStory />

      {/* The editorial pages rise over the dark story as a single light sheet. */}
      <div className="relative z-10 -mt-6 rounded-t-3xl bg-soft">
        <BrandStatement />
        <NeuroBytes />
        <WeeklyEdit />
        <Founder />
        <Consultations />
        <Podcast />
        <Newsletter />
        {/* Booking closes the page: every Book Consultation link leads here. */}
        <BookConsultation />
      </div>
    </>
  );
}
