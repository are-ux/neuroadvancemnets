"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { buttonClass } from "@/components/ui/button";
import { consultationLink, navItems } from "@/lib/content/site";
import { TONE_BAND_MARGIN } from "@/lib/design-tokens";

const observed = [...navItems.map((n) => n.section), consultationLink.section];

/** Tracks which homepage section crosses the middle of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = observed.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

/**
 * True while an element marked data-nav-tone="dark" sits under the navigation.
 * The attribute can change while an element stays in place (the brain story dims
 * as it scrolls), so the hook also re-reads it when the story announces a change.
 */
function useDarkBackdrop() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-tone]"));
    if (!zones.length) return;
    const under = new Set<HTMLElement>();
    const evaluate = () => setDark([...under].some((zone) => zone.dataset.navTone === "dark"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) under.add(entry.target as HTMLElement);
          else under.delete(entry.target as HTMLElement);
        }
        evaluate();
      },
      { rootMargin: TONE_BAND_MARGIN },
    );
    zones.forEach((zone) => io.observe(zone));
    window.addEventListener("na:tone", evaluate);
    return () => {
      io.disconnect();
      window.removeEventListener("na:tone", evaluate);
    };
  }, []);
  return dark;
}

/**
 * The supplied logo, never recoloured. Rendered at its display size so the
 * browser receives a file close to the pixels it paints, which keeps it sharp.
 * Source artwork is 960 x 195 (ratio 4.92).
 */
function Logo({ height }: { height: 28 | 32 }) {
  const width = Math.round((height * 960) / 195);
  return (
    <Image
      src="/brand/logo.png"
      alt="NeuroAdvancements"
      width={width}
      height={height}
      quality={95}
      priority
      style={{ width, height }}
    />
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const dark = useDarkBackdrop();
  const onBookingPage = usePathname() === consultationLink.href;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onWide = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
      document.body.style.overflow = "";
    };
  }, [open]);

  const bar = "h-0.5 w-5 rounded-full bg-navy transition-transform motion-settle";

  return (
    <header className={open ? "menu-open" : ""}>
      {/* The bar spans the page grid, so the logo and the action align with the content below it. */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6">
        <nav
          aria-label="Main"
          data-tone={dark && !open ? "dark" : "light"}
          className="glass pointer-events-auto mx-auto flex h-16 max-w-[1184px] items-center justify-between gap-4 rounded-2xl pl-4 pr-3 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:pl-6"
        >
          <Link
            href="/#home"
            aria-label="NeuroAdvancements home"
            className="justify-self-start rounded-lg py-2"
            onClick={() => setOpen(false)}
          >
            <span className="hidden sm:block">
              <Logo height={32} />
            </span>
            <span className="sm:hidden">
              <Logo height={28} />
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const current = active === item.section;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "true" : undefined}
                    className={`block rounded-lg px-3 py-2 title-4 transition-colors motion-hover ${
                      current ? "bg-navy/[0.07] text-navy" : "text-slate hover:bg-navy/[0.04] hover:text-navy"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 justify-self-end">
            <Link
              href={consultationLink.href}
              aria-current={onBookingPage ? "page" : active === consultationLink.section ? "true" : undefined}
              className={buttonClass("primary", "sm", "hidden sm:inline-flex")}
              onClick={() => setOpen(false)}
            >
              {consultationLink.label}
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="flex size-10 flex-col items-center justify-center gap-1 rounded-lg transition-colors motion-hover hover:bg-navy/5 active:scale-[0.98] lg:hidden"
            >
              <span aria-hidden="true" className={`${bar} ${open ? "translate-y-[3px] rotate-45" : ""}`} />
              <span aria-hidden="true" className={`${bar} ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* Full height mobile panel: base surface at high opacity over a strong blur. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-soft/95 px-4 pb-10 pt-24 backdrop-blur-xl transition-opacity motion-hover lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-2">
          {navItems.map((item, i) => (
            <li key={item.href} className="menu-link" style={{ "--link-delay": `${Math.min(i * 60, 400)}ms` } as CSSProperties}>
              <Link
                href={item.href}
                aria-current={active === item.section ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 heading-4 transition-colors motion-hover hover:bg-navy/5 ${
                  active === item.section ? "text-navy" : "text-slate"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="menu-link" style={{ "--link-delay": `${Math.min(navItems.length * 60, 400)}ms` } as CSSProperties}>
          <Link href={consultationLink.href} onClick={() => setOpen(false)} className={buttonClass("primary", "md", "w-full")}>
            {consultationLink.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
