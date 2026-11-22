// Structured data for the Lodge, rendered once in app/layout.tsx.
// Owner-approved street address and rooftop point matched to the Gardner listing.

import { lodgePhoto, lodgePhotos } from "../_data/lodge-photos";

const SITE = "https://kendallpondlodge.com";

const featuredOrders = [3, 1, 4, 5, 25, 17, 29, 2];
const listingPhotos = [
  ...featuredOrders.map(lodgePhoto),
  ...lodgePhotos.filter(photo => !featuredOrders.includes(photo.order)),
];

const data = {
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "@id": `${SITE}/#lodge`,
  identifier: "kpl-gardner-001",
  alternateName: "Kendall Pond Lodge",
  name: "The Lodge at Kendall Pond",
  url: SITE,
  description:
    "The Lodge at Kendall Pond in Gardner, Massachusetts. Three bedrooms, private shoreline, dock, hot tub, and room for eight.",
  latitude: 42.562942,
  longitude: -72.019831,
  image: listingPhotos.map(photo => new URL(photo.src, SITE).href),
  address: {
    "@type": "PostalAddress",
    streetAddress: "110 Kendall Pond West",
    addressLocality: "Gardner",
    addressRegion: "MA",
    postalCode: "01440",
    addressCountry: "US",
  },
  containsPlace: {
    "@type": "Accommodation",
    additionalType: "EntirePlace",
    numberOfBedrooms: 3,
    occupancy: { "@type": "QuantitativeValue", value: 8 },
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
