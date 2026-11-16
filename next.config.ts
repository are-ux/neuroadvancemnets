import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: { qualities: [75, 95] },
  // The calendar used to live on its own page. Old links and bookmarks go to the booking section.
  async redirects() {
    return [{ source: "/consultations/book", destination: "/#book-consultation", permanent: false }];
  },
  // Baseline security headers for every response. A content security policy is not set here:
  // it needs to be written and tested against Calendly's embed before it is enforced.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
      // The brain model and stills are not content hashed, so they get a day, not a year.
      { source: "/models/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
