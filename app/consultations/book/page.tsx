import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowSquareOut, LockKey, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { CalendlyEmbed } from "@/components/consultations/calendly-embed";
import { ButtonLink } from "@/components/ui/button";
import { SignupForm } from "@/components/ui/signup-form";
import { booking } from "@/lib/content/booking";
import { bookingSteps } from "@/lib/content/editorial";

export const metadata: Metadata = {
  title: "Book a consultation",
  description: "Schedule an online consultation with Amna Noor through Calendly.",
  // Kept out of search results until consultations are confirmed and open.
  robots: { index: false },
};

/**
 * Booking page. With booking switched on it embeds the real Calendly event; otherwise
 * it explains that scheduling is not open yet. Either way it collects no medical
 * information: Calendly is a scheduling tool, not a medical record.
 */
export default function BookConsultationPage() {
  return (
    <div className="shell pb-24 pt-32">
      <header className="flex max-w-[680px] flex-col items-start gap-4">
        <ButtonLink href="/#consultations" variant="outline-light" size="sm">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to home
        </ButtonLink>
        <p className="flex items-center gap-2 caption-1 text-slate">
          <span aria-hidden="true" className="h-px w-6 bg-navy/40" />
          Consultations
        </p>
        <h1 className="heading-3 text-navy lg:heading-1">Book an online consultation</h1>
        <p className="body-3 text-slate lg:title-2">
          {booking.enabled
            ? "Choose a time below to schedule an online consultation with Amna Noor. The calendar shows the appointments that are currently available."
            : "Online consultations with Amna Noor are not open for booking yet. Scheduling will appear on this page once it is."}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Calendar */}
        <section aria-labelledby="calendar-title" className="lg:order-2 lg:col-span-8">
          <h2 id="calendar-title" className="sr-only">
            Booking calendar
          </h2>
          <div className="rounded-3xl border border-navy/10 bg-white p-2">
            {booking.enabled ? (
              <CalendlyEmbed url={booking.url} />
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-2xl p-6 lg:p-10">
                <p className="rounded-lg border border-navy/15 px-2 py-1 caption-3 text-slate">Not yet open</p>
                <p className="heading-5 text-navy">Booking opens once consultations are confirmed.</p>
                <p className="max-w-[680px] body-3 text-slate">
                  Leave your email address and you will hear when scheduling opens. Please do not send medical
                  details: this form asks for an email address only.
                </p>
                <SignupForm list="consultations" submitLabel="Notify me" />
              </div>
            )}
          </div>
          {booking.enabled && (
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 body-6 text-slate">
              Calendar not showing?
              <a
                href={booking.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg body-4 text-navy underline underline-offset-4"
              >
                Open the booking page on Calendly
                <ArrowSquareOut aria-hidden="true" className="size-4" />
              </a>
            </p>
          )}
        </section>

        {/* Process and notices */}
        <aside className="flex flex-col gap-8 lg:order-1 lg:col-span-4">
          <div>
            <h2 className="caption-1 text-slate">How booking works</h2>
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
            <div className="flex flex-col gap-1">
              <h2 className="body-4 text-navy">Not for emergencies</h2>
              <p className="body-6 text-slate">
                Online consultations are not for medical emergencies. If you think you may be having one, call your
                local emergency number or go to the nearest emergency department now.
              </p>
            </div>
          </div>

          <div role="note" className="flex gap-3 rounded-2xl bg-ice p-4">
            <LockKey aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 text-navy" />
            <div className="flex flex-col gap-1">
              <h2 className="body-4 text-navy">Your information</h2>
              <p className="body-6 text-slate">
                Scheduling is provided by Calendly, a separate service. The details you enter in the calendar go to
                Calendly and are handled under its privacy policy, and Calendly may set cookies. Use it to arrange a
                time only. Please do not enter medical history, test results, or other clinical details.
              </p>
              <p className="body-6 text-slate">
                See our{" "}
                <Link href="/privacy" className="rounded-lg body-4 text-navy underline underline-offset-4">
                  privacy policy
                </Link>{" "}
                and{" "}
                <Link href="/medical-disclaimer" className="rounded-lg body-4 text-navy underline underline-offset-4">
                  medical disclaimer
                </Link>
                .
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
