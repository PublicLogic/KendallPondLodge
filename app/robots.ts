import type { MetadataRoute } from "next";

const SITE = "https://kendallpondlodge.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes, private calendar links and checkout stay out of search.
        // /owner is left crawlable so Google can see its noindex tag.
        disallow: ["/api/", "/calendar/", "/checkout"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
