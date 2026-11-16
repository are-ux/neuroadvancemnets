import type { MetadataRoute } from "next";
import { site } from "@/lib/content/site";

/**
 * Only the homepage is listed. The topic pages are in preparation and the legal pages
 * are drafts: each is marked noindex and will be added here when it is real.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/`, changeFrequency: "weekly", priority: 1 }];
}
