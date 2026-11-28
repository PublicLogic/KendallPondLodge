import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import stay from "../app/_data/public-stay.json" with { type: "json" };

test("renders the Lodge's approved room counts and amenities on the accommodation", async (t) => {
  const server = await createServer({
    configFile: false,
    resolve: { tsconfigPaths: true },
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  t.after(() => server.close());
  const { LodgeJsonLd } = await server.environments.ssr.runner.import("/app/_components/LodgeJsonLd.tsx");
  const html = renderToStaticMarkup(createElement(LodgeJsonLd));
  const script = html.match(/<script\b[^>]*\btype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(script, "renders a JSON-LD script");
  const listing = JSON.parse(script[1]);

  assert.equal(listing["@type"], "VacationRental");
  assert.equal(listing.identifier, "kpl-gardner-001");
  const place = listing.containsPlace;
  assert.equal(place["@type"], "Accommodation");
  assert.equal(place.additionalType, "EntirePlace");
  assert.equal(place.occupancy.value, stay.maxGuests);
  assert.equal(place.numberOfBedrooms, stay.bedrooms);
  assert.equal(place.numberOfBathroomsTotal, stay.bathrooms);

  const amenities = new Map(place.amenityFeature.map((feature) => {
    assert.equal(feature["@type"], "LocationFeatureSpecification");
    return [feature.name, feature.value];
  }));
  assert.equal(amenities.get("hotTub"), true);
  assert.equal(amenities.get("kitchen"), true);
  assert.equal(amenities.get("patio"), true);
  assert.equal(amenities.get("parkingType"), "Free");
  assert.equal(amenities.get("petsAllowed"), stay.maxPets > 0);
  assert.equal(amenities.get("smokingAllowed"), false);
});
