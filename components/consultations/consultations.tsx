import { ArrowRight, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { booking } from "@/lib/content/booking";
import { bookingSteps } from "@/lib/content/editorial";

/**
 * Consultations on the homepage: a calm statement of where things stand and one
 * route to the booking page. Scheduling itself lives on /consultations/book.
 * No appointment length, price, or type is stated here: the calendar shows them.
 */
export function Consultations() {
  return (
    <section id="consultations" aria-labelledby="consultations-title" className="py-20 lg:py-24">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8">
        <Reveal className="flex flex-col items-start gap-4 lg:col-span-6">
          <SectionLabel>Consultations</SectionLabel>
          <h2 id="consultations-title" className="heading-3 text-navy lg:heading-2">
            Online consultations{booking.enabled ? "." : ", coming soon."}
          </h2>
          <p className="max-w-[680px] body-3 text-slate lg:title-2">
            {booking.enabled
              ? "Online neurological consultations with Amna Noor are scheduled through Calendly. Choose a time that suits you on the booking page."
              : "Amna plans to offer online neurological consultations once she is professionally authorized to do so. Scheduling will open on the booking page."}
          </p>
          <ButtonLink href={booking.route} className="mt-2">
            {booking.enabled ? "Book a consultation" : "Go to the booking page"}
            <ArrowRight aria-hidden="true" weight="bold" className="size-4" />
          </ButtonLink>
        </Reveal>

        <Reveal delay={90} className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8">
          <div>
            <p className="caption-1 text-slate">How booking works</p>
            <ol className="mt-3 flex flex-col">
              {bookingSteps.map((step, i) => (
                <li key={step.title}>
                  <div aria-hidden="true" className="h-px bg-navy/10" />
                  <div className="grid grid-cols-[32px_1fr] gap-x-4 gap-y-1 py-4">
                    <span className="caption-1 tabular-nums text-slate">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="title-3 text-navy">{step.title}</h3>
                    <p className="col-start-2 body-6 text-slate">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div aria-hidden="true" className="h-px bg-navy/10" />
          </div>

          <div role="note" className="flex gap-3 rounded-2xl bg-ice p-4">
            <WarningCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 text-navy" />
            <p className="body-6 text-slate">
              <span className="body-4 text-navy">Online consultations are not for emergencies.</span> If you think you
              may be having a medical emergency, call your local emergency number or go to the nearest emergency
              department now.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
