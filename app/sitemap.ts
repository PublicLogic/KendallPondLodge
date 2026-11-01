import type { MetadataRoute } from "next";

const SITE = "https://kendallpondlodge.com";

// Public guest-facing pages only. /owner is intentionally excluded.
const PAGES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/book", priority: 0.9, changeFrequency: "daily" },
  { path: "/lodge", priority: 0.8, changeFrequency: "monthly" },
  { path: "/rates", priority: 0.8, changeFrequency: "weekly" },
  { path: "/photos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/grounds", priority: 0.7, changeFrequency: "monthly" },
  { path: "/explore", priority: 0.6, changeFrequency: "monthly" },
  { path: "/guidebook", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
