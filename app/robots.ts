import type { MetadataRoute } from "next";

const SITE = "https://kendallpondlodge.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Owner tools, API routes, private calendar links and checkout stay out of search.
        disallow: ["/owner", "/api/", "/calendar/", "/checkout"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
