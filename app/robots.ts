import type { MetadataRoute } from "next";
import { site } from "@/lib/content/site";

/** Crawlers may read the site, except the API. Unfinished pages carry their own noindex tag, which a crawler can only honour if it is allowed to fetch them. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
