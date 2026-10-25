import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KPL — Lodge at Kendall Pond",
    short_name: "KPL",
    description: "Booking, KPL Remote, and the private guest Guidebook for the Lodge at Kendall Pond.",
    start_url: "/",
    display: "standalone",
    background_color: "#112233",
    theme_color: "#112233",
  };
}
