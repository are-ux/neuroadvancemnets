import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SiteNav } from "@/components/navigation/site-nav";
import { SiteFooter } from "@/components/newsletter/site-footer";
import { site } from "@/lib/content/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.social.title,
    description: site.social.description,
    url: "/",
    images: [site.social.image],
  },
  twitter: {
    card: "summary_large_image",
    title: site.social.title,
    description: site.social.description,
    images: [site.social.image],
  },
};

export const viewport: Viewport = { themeColor: "#f7f8f6" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body className="min-h-screen">
        <noscript>
          <style>{`.reveal{opacity:1;transform:none}.tagline-word{opacity:1}.story-track{height:auto!important;margin-top:0!important}.story-frame{position:static!important;height:auto!important}.beat-copy{position:static!important;opacity:1!important;transform:none!important;padding-block:48px}`}</style>
        </noscript>
        <a
          href="#main"
          className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-navy px-3 py-2 button-sm text-white transition-transform motion-settle focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <SiteNav />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
