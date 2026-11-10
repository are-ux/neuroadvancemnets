import Image from "next/image";
import Link from "next/link";
import { InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";
import { consultationLink, legalLinks, navItems, site, socialLinks } from "@/lib/content/site";

const socialIcons = { instagram: InstagramLogo, linkedin: LinkedinLogo, youtube: YoutubeLogo, x: XLogo };
const linkClass = "rounded-lg body-6 text-slate transition-colors motion-hover hover:text-navy";

export function SiteFooter() {
  return (
    <footer className="bg-white">
      <div className="shell grid gap-10 py-16 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Link href="/#home" aria-label="NeuroAdvancements home" className="self-start rounded-lg">
            <Image src="/brand/logo.png" alt="NeuroAdvancements" width={960} height={195} className="h-8 w-auto" />
          </Link>
          <p className="max-w-sm body-6 text-slate">
            Neuroscience education, neurotechnology, and a weekly editorial on advances in neurology. Led by{" "}
            {site.founder}.
          </p>
          <ul className="flex gap-2" aria-label="Social profiles">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.icon];
              const box = "flex size-10 items-center justify-center rounded-lg border border-navy/10";
              return (
                <li key={social.label}>
                  {social.href ? (
                    <a href={social.href} aria-label={social.label} rel="noopener noreferrer" target="_blank" className={`${box} text-navy transition-colors motion-hover hover:bg-navy/5 active:scale-[0.98]`}>
                      <Icon aria-hidden="true" className="size-5" />
                    </a>
                  ) : (
                    <span role="img" aria-label={`${social.label} profile, link not yet available`} title="Profile link not yet available" className={`${box} cursor-not-allowed text-slate/40`}>
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <p className="caption-3 text-slate/70">Explore</p>
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
            <p className="caption-3 text-slate/70">Connect</p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={consultationLink.href} className={linkClass}>
                  Consultations
                </Link>
              </li>
              <li>
                <Link href="/#newsletter" className={linkClass}>
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <p className="caption-3 text-slate/70">Legal</p>
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

      <div className="shell">
        <div aria-hidden="true" className="h-px bg-navy/10" />
        <div className="flex flex-col gap-3 py-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <p className="max-w-[680px] caption-2 text-slate/80">
            Medical disclaimer: content on NeuroAdvancements is for education only. It is not medical advice and does
            not replace a consultation with a qualified clinician. In an emergency, call your local emergency number.
          </p>
          <p className="shrink-0 caption-2 text-slate/80">&copy; {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
