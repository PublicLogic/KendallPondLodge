import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Lodge at Kendall Pond",
    short_name: "Kendall Pond",
    description:
      "Lakefront stays at the Lodge at Kendall Pond in Gardner, Massachusetts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#f5f0e8",
    icons: [
      {
        src: "/images/kpl/lodge-seal.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
