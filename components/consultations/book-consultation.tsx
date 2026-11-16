import Link from "next/link";
import { ArrowSquareOut, LockKey, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { SignupForm } from "@/components/ui/signup-form";
import { booking, BOOKING_ANCHOR } from "@/lib/content/booking";
import { signups } from "@/lib/content/site";
import { LazyCalendly } from "./lazy-calendly";

const HEADING_ID = "book-consultation-title";

/**
 * Booking, at the foot of the homepage. Every "Book Consultation" link on the site
 * leads here. With booking switched on it shows the real Calendly calendar at the
 * full width of the page; otherwise it says scheduling is not open yet and Calendly
 * is never loaded. It collects no medical information either way.
 */
export function BookConsultation() {
  return (
    <section id={BOOKING_ANCHOR} aria-labelledby={HEADING_ID} className="bg-white py-20 lg:py-24">
      <div className="shell">
        <Reveal className="flex max-w-[680px] flex-col gap-4">
          <SectionLabel>Book</SectionLabel>
          <h2 id={HEADING_ID} tabIndex={-1} className="rounded-lg heading-3 text-navy lg:heading-1">
            Book an online consultation
          </h2>
          <p className="body-3 text-slate lg:title-2">
            {booking.enabled
              ? "Choose an available date and time for your online consultation."
              : "Online consultations with Amna Noor are not open for booking yet. Scheduling will appear here once it is."}
          </p>
        </Reveal>

        {/* The calendar takes the full width of the page grid, so Calendly has room for its widest layout. */}
        <div className="mt-10 rounded-3xl border border-navy/10 bg-white p-2 lg:mt-12">
          {booking.enabled ? (
            <LazyCalendly url={booking.url} headingId={HEADING_ID} />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-2xl p-6 lg:p-10">
              <p className="rounded-lg border border-navy/15 px-2 py-1 caption-3 text-slate">Not yet open</p>
              <p className="heading-5 text-navy">Booking opens once consultations are confirmed.</p>
              {signups.enabled ? (
                <>
                  <p className="max-w-[680px] body-3 text-slate">
                    Leave your email address and you will hear when scheduling opens. Please do not send medical
                    details: this form asks for an email address only.
                  </p>
                  <SignupForm list="consultations" submitLabel="Notify me" />
                </>
              ) : (
                <p className="max-w-[680px] body-3 text-slate">
                  The calendar will appear in this space as soon as scheduling opens. Until then, you can reach us
                  using the contact details at the foot of the page.
                </p>
              )}
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

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:gap-8">
          <div role="note" className="flex gap-3 rounded-2xl bg-ice p-4">
            <WarningCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 text-navy" />
            <div className="flex flex-col gap-1">
              <h3 className="body-4 text-navy">Not for emergencies</h3>
              <p className="body-6 text-slate">
                Online consultations are not for medical emergencies. If you think you may be having one, call your
                local emergency number or go to the nearest emergency department now.
              </p>
            </div>
          </div>

          <div role="note" className="flex gap-3 rounded-2xl bg-ice p-4">
            <LockKey aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 text-navy" />
            <div className="flex flex-col gap-1">
              <h3 className="body-4 text-navy">Your information</h3>
              <p className="body-6 text-slate">
                Scheduling is provided by Calendly, a separate service. Details you enter in the calendar go to
                Calendly under its privacy policy, and Calendly may set cookies. Use it to arrange a time only: please
                do not enter medical history, test results, or other clinical details. See our{" "}
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
        </div>
      </div>
    </section>
  );
}
