"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { buttonClass } from "@/components/ui/button";
import { consultationLink, navItems } from "@/lib/content/site";

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

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

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
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav
          aria-label="Main"
          className="pointer-events-auto flex w-full items-center justify-between gap-6 rounded-2xl border border-navy/10 bg-white/80 py-2 pl-4 pr-2 backdrop-blur-md lg:w-auto"
        >
          <Link href="/#home" aria-label="NeuroAdvancements home" className="rounded-lg" onClick={() => setOpen(false)}>
            <Image src="/brand/logo.png" alt="NeuroAdvancements" width={960} height={195} priority className="h-6 w-auto" />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const current = active === item.section;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "true" : undefined}
                    className={`relative block rounded-lg px-3 py-2 title-4 transition-colors motion-hover hover:bg-navy/5 ${
                      current ? "text-navy" : "text-slate/80 hover:text-navy"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-orange transition-opacity motion-hover ${
                        current ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href={consultationLink.href}
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 heading-4 text-navy transition-colors motion-hover hover:bg-navy/5"
              >
                {item.label}
                {active === item.section && <span aria-hidden="true" className="size-2 rounded-full bg-orange" />}
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
