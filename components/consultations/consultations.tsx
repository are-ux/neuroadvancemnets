import { CalendarBlank, Clock, LockKey, Stethoscope, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { SignupForm } from "@/components/ui/signup-form";
import { consultationSteps } from "@/lib/content/editorial";

const icons = [Stethoscope, Clock, CalendarBlank, LockKey];

/**
 * Consultations are not yet available. This section explains the planned
 * pathway, collects an email address only, and never asks for medical details.
 */
export function Consultations() {
  return (
    <section id="consultations" aria-labelledby="consultations-title" className="bg-white py-20 lg:py-24">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="flex flex-col gap-4 lg:col-span-6">
          <SectionLabel>Consultations</SectionLabel>
          <h2 id="consultations-title" className="heading-3 text-navy lg:heading-2">
            Online consultations, coming soon.
          </h2>
          <p className="max-w-[680px] body-3 text-slate">
            Amna plans to offer online neurological consultations once she is professionally authorized to do so.
            Appointment types, times, and booking will be published here first.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <p className="title-3 text-navy">Hear when booking opens</p>
            <SignupForm list="consultations" submitLabel="Notify me" />
            <p className="max-w-md caption-2 text-slate/80">
              Please do not send medical details. This form asks for an email address only.
            </p>
          </div>
        </Reveal>

        <Reveal delay={90} className="flex flex-col gap-4 lg:col-span-6">
          <div className="rounded-3xl border border-navy/10 bg-soft p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="heading-6 text-navy">How booking will work</h3>
              <span className="rounded-lg border border-navy/15 bg-white px-2 py-1 caption-3 text-slate">Not yet open</span>
            </div>
            <ol className="mt-6 flex flex-col">
              {consultationSteps.map((step, i) => {
                const Icon = icons[i];
                return (
                  <li key={step.title}>
                    <div aria-hidden="true" className="h-px bg-navy/10" />
                    <div className="flex items-center gap-4 py-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-navy">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <p className="flex-1 title-3 text-navy">{step.title}</p>
                      <p className="caption-2 text-slate/80">{step.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <button type="button" disabled className={buttonClass("primary", "md", "mt-4 w-full")}>
              Booking is not open yet
            </button>
          </div>

          <div role="note" className="flex gap-3 rounded-2xl border border-orange/50 bg-white p-4">
            <WarningCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 text-orange" />
            <div className="flex flex-col gap-1">
              <p className="body-4 text-navy">This website does not provide emergency care.</p>
              <p className="body-6 text-slate">
                If you think you may be having a medical emergency, call your local emergency number or go to the
                nearest emergency department now. Content on this site is educational and is not medical advice.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
