export const site = {
  name: "NeuroAdvancements",
  founder: "Amna Noor",
  title: "NeuroAdvancements: understanding the brain, exploring what's next",
  description:
    "Neuroscience education, emerging neurotechnology, and a weekly editorial on advances in neurology, led by Amna Noor.",
  /** Set NEXT_PUBLIC_SITE_URL in production so social tags resolve to absolute URLs. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Official contact details, confirmed by the owner. Shown in the footer. */
  contact: {
    email: "neuroadvancements@gmail.com",
    /** display is what visitors read. tel is the same number with no spaces, for the tel: link. */
    phone: { display: "+92 301 8359356", tel: "+923018359356" },
  },
} as const;

export type NavItem = { label: string; href: string; section: string };

export const navItems: readonly NavItem[] = [
  { label: "Home", href: "/#home", section: "home" },
  { label: "NeuroBytes", href: "/#neurobytes", section: "neurobytes" },
  { label: "The Weekly Edit", href: "/#weekly-edit", section: "weekly-edit" },
  { label: "Podcast", href: "/#podcast", section: "podcast" },
  { label: "About Amna", href: "/#about", section: "about" },
];

export const consultationLink = { label: "Book Consultation", href: "/#book-consultation", section: "book-consultation" };

/**
 * Social profiles have not been supplied. Entries without an href render as
 * visibly disabled items instead of dead links.
 */
export const socialLinks: readonly { label: string; icon: "instagram" | "linkedin" | "youtube" | "x"; href?: string }[] = [
  { label: "Instagram", icon: "instagram" },
  { label: "LinkedIn", icon: "linkedin" },
  { label: "YouTube", icon: "youtube" },
  { label: "X", icon: "x" },
];

export const legalLinks = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Medical disclaimer", href: "/medical-disclaimer" },
] as const;

/**
 * Email signups (newsletter, podcast, booking notice). They stay closed until a mailing
 * provider is connected to /api/subscribe and NEXT_PUBLIC_SIGNUPS_ENABLED is "true".
 */
export const signups = { enabled: process.env.NEXT_PUBLIC_SIGNUPS_ENABLED === "true" } as const;
