import manifest from "@/public/images/kpl/website-top-50/manifest.json";

/**
 * Public-safe, curated photographs. The manifest is the single source for
 * image paths, alt text, and dimensions; do not duplicate the 50-file list.
 */
export const lodgePhotos = manifest.photos;
export type LodgePhoto = (typeof lodgePhotos)[number];

export function lodgePhoto(order: number): LodgePhoto {
  const photo = lodgePhotos.find((item) => item.order === order);
  if (!photo) {
    throw new Error("Missing curated Lodge photo " + order);
  }
  return photo;
}

export const photoFilters = [
  { id: "all", label: "All photos", categories: [] },
  { id: "property", label: "The property", categories: ["01-Hero", "02-Exterior"] },
  { id: "living", label: "Living & dining", categories: ["03-Living-Spaces", "04-Kitchen-and-Dining"] },
  { id: "bedrooms", label: "Bedrooms & baths", categories: ["05-Bedrooms", "06-Bathrooms"] },
  { id: "outdoor", label: "Deck & hot tub", categories: ["07-Deck-and-Outdoor-Living", "08-Hot-Tub"] },
  { id: "waterfront", label: "Waterfront", categories: ["09-Waterfront-and-Grounds"] },
] as const;

export type PhotoFilterId = (typeof photoFilters)[number]["id"];
