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
    title: site.title,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = { themeColor: "#001a38" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body className="min-h-screen">
        <noscript>
          <style>{`.reveal{opacity:1;transform:none}.tagline-word{opacity:1}`}</style>
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
