import Image from "next/image";
import Link from "next/link";
import { InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";
import { booking } from "@/lib/content/booking";
import { legalLinks, navItems, site, socialLinks } from "@/lib/content/site";

const socialIcons = { instagram: InstagramLogo, linkedin: LinkedinLogo, youtube: YoutubeLogo, x: XLogo };
const linkClass = "rounded-lg body-6 text-slate transition-colors motion-hover hover:text-navy";
const headingClass = "caption-1 text-navy";

/**
 * Footer. Social profiles and contact details appear only once they are configured
 * in lib/content/site.ts: nothing is shown as a placeholder for a link that does not exist.
 */
export function SiteFooter() {
  const socials = socialLinks.filter((social) => social.href);

  return (
    <footer className="bg-white">
      <div className="shell">
        <div aria-hidden="true" className="h-0.5 bg-navy" />
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="flex flex-col items-start gap-4 lg:col-span-5">
            <Link href="/#home" aria-label="NeuroAdvancements home" className="rounded-lg">
              <Image src="/brand/logo.png" alt="NeuroAdvancements" width={177} height={36} quality={95} style={{ width: 177, height: 36 }} />
            </Link>
            <p className="max-w-sm body-6 text-slate">
              Neuroscience education, neurotechnology, and a weekly editorial on advances in neurology. Led by{" "}
              {site.founder}.
            </p>
            {socials.length > 0 && (
              <ul className="flex gap-2" aria-label="Social profiles">
                {socials.map((social) => {
                  const Icon = socialIcons[social.icon];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        aria-label={social.label}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="flex size-10 items-center justify-center rounded-lg text-navy transition-colors motion-hover hover:bg-navy/5 active:scale-[0.98]"
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            <div className="flex flex-col gap-3">
              <p className={headingClass}>Explore</p>
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <p className={headingClass}>Connect</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link href={booking.route} className={linkClass}>
                    Book a consultation
                  </Link>
                </li>
                <li>
                  <Link href="/#newsletter" className={linkClass}>
                    Newsletter
                  </Link>
                </li>
                {site.contactEmail && (
                  <li>
                    <a href={`mailto:${site.contactEmail}`} className={linkClass}>
                      {site.contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <p className={headingClass}>Legal</p>
              <ul className="flex flex-col gap-2">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div aria-hidden="true" className="h-px bg-navy/10" />
        <div className="flex flex-col gap-3 py-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <p className="max-w-[680px] caption-2 text-slate">
            Medical disclaimer: content on NeuroAdvancements is for education only. It is not medical advice and does
            not replace a consultation with a qualified clinician. In an emergency, call your local emergency number.
          </p>
          <p className="shrink-0 caption-2 text-slate">&copy; {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
