import { BrainStory } from "@/components/brain-experience/brain-story";
import { Consultations } from "@/components/consultations/consultations";
import { BrandStatement } from "@/components/editorial/brand-statement";
import { Founder } from "@/components/editorial/founder";
import { WeeklyEdit } from "@/components/editorial/weekly-edit";
import { NeuroBytes } from "@/components/neurobytes/neurobytes";
import { Newsletter } from "@/components/newsletter/newsletter";
import { Podcast } from "@/components/podcast/podcast";

export default function HomePage() {
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
      </div>
    </>
  );
}
