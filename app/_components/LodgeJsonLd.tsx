// Structured data for the Lodge, rendered once in app/layout.tsx.
// Street address and exact coordinates are left out on purpose.

const SITE = "https://kendallpondlodge.com";

const data = {
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "@id": `${SITE}/#lodge`,
  name: "The Lodge at Kendall Pond",
  url: SITE,
  description:
    "The Lodge at Kendall Pond in Gardner, Massachusetts. Three bedrooms, private shoreline, dock, hot tub, and room for eight.",
  image: [`${SITE}/opengraph-image.png`],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gardner",
    addressRegion: "MA",
    postalCode: "01440",
    addressCountry: "US",
  },
  containsPlace: {
    "@type": "Accommodation",
    additionalType: "EntirePlace",
    numberOfBedrooms: 3,
    occupancy: { "@type": "QuantitativeValue", maxValue: 8 },
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Waterfront", value: true },
    { "@type": "LocationFeatureSpecification", name: "Private dock", value: true },
    { "@type": "LocationFeatureSpecification", name: "Hot tub", value: true },
    { "@type": "LocationFeatureSpecification", name: "Fire pit", value: true },
    { "@type": "LocationFeatureSpecification", name: "Kayaks", value: true },
  ],
  potentialAction: { "@type": "ReserveAction", target: `${SITE}/book` },
};

export function LodgeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
