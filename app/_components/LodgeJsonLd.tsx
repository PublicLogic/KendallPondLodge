// Structured data for the Lodge, rendered once in app/layout.tsx.
// Owner-approved street address and rooftop point matched to the Gardner listing.

import { lodgePhoto, lodgePhotos } from "../_data/lodge-photos";
import stay from "../_data/public-stay.json";

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
    `The Lodge at Kendall Pond in Gardner, Massachusetts has ${stay.bedrooms} bedrooms and sleeps up to ${stay.maxGuests}. It has a private shoreline and dock, a hot tub, and a fire pit. Kayak use depends on the season and pond conditions.`,
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
    numberOfBedrooms: stay.bedrooms,
    numberOfBathroomsTotal: stay.bathrooms,
    occupancy: { "@type": "QuantitativeValue", value: stay.maxGuests },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "hotTub", value: true },
      { "@type": "LocationFeatureSpecification", name: "kitchen", value: true },
      { "@type": "LocationFeatureSpecification", name: "patio", value: true },
      { "@type": "LocationFeatureSpecification", name: "parkingType", value: "Free" },
      { "@type": "LocationFeatureSpecification", name: "petsAllowed", value: stay.maxPets > 0 },
      { "@type": "LocationFeatureSpecification", name: "smokingAllowed", value: false },
    ],
  },
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
