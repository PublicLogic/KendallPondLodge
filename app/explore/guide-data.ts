/** Curated, source-linked local guest picks, not an unsourced ranking.
 *  Keep one primary source per recommendation and do not hard-code hours,
 *  prices, availability, travel times, or event dates here.
 */
export type ExploreCategory = "food" | "outside" | "rain" | "seasonal";

export type ExplorePick = {
  slug: string;
  name: string;
  category: ExploreCategory;
  location: string;
  detail: string;
  bestFor: string;
  url: string;
  linkLabel: string;
};

export const exploreCategories: readonly { id: "all" | ExploreCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "food", label: "Food & coffee" },
  { id: "outside", label: "Outdoors" },
  { id: "rain", label: "Indoors" },
  { id: "seasonal", label: "Seasonal" },
];

export const explorePicks: readonly ExplorePick[] = [
  {
    slug: "blue-moon-diner",
    name: "Blue Moon Diner",
    category: "food",
    location: "Downtown Gardner",
    detail: "A proper Worcester Lunch Car, serving breakfast and lunch right in Gardner.",
    bestFor: "A diner breakfast",
    url: "https://business.gardnerma.com/list/member/blue-moon-diner-1363",
    linkLabel: "Diner details",
  },
  {
    slug: "cafe-edesia",
    name: "Cafe Edesia",
    category: "food",
    location: "Gardner",
    detail: "Coffee, smoothies and something to eat before you head out.",
    bestFor: "Coffee stop",
    url: "https://cafeedesia.toast.site/",
    linkLabel: "Cafe menu",
  },
  {
    slug: "gardner-ale-house",
    name: "Gardner Ale House",
    category: "food",
    location: "Downtown Gardner",
    detail: "Moon Hill Brewing's downtown spot for dinner. Nobody has to cook.",
    bestFor: "Dinner downtown",
    url: "https://www.moonhillbrewing.com/",
    linkLabel: "Restaurant details",
  },
  {
    slug: "sawa",
    name: "Sawa Asian Cuisine & Lounge",
    category: "food",
    location: "Gardner",
    detail: "Sushi, Japanese and Chinese dishes. Takeout works nicely back at the house.",
    bestFor: "Takeout night",
    url: "https://www.sawaasiancuisine.com/",
    linkLabel: "Menu and location",
  },
  {
    slug: "wachusett-reservation",
    name: "Wachusett Mountain State Reservation",
    category: "outside",
    location: "Princeton",
    detail: "Trail shoes and summit views, weather permitting. Check the state trail map and access conditions first.",
    bestFor: "A mountain day",
    url: "https://www.mass.gov/locations/wachusett-mountain-state-reservation",
    linkLabel: "Trails and access",
  },
  {
    slug: "dunn-state-park",
    name: "Dunn State Park",
    category: "outside",
    location: "Gardner",
    detail: "Paths around Dunn Pond, a picnic spot, and no need for a big day out. Check seasonal access.",
    bestFor: "An easy walk",
    url: "https://www.mass.gov/locations/dunn-state-park",
    linkLabel: "Park details",
  },
  {
    slug: "red-apple-farm",
    name: "Red Apple Farm",
    category: "seasonal",
    location: "Phillipston",
    detail: "Cider donuts and a farm store in Phillipston. Orchard activities depend on the season.",
    bestFor: "Cider donuts",
    url: "https://www.redapplefarm.com/",
    linkLabel: "Farm and events",
  },
  {
    slug: "fitchburg-art-museum",
    name: "Fitchburg Art Museum",
    category: "rain",
    location: "Fitchburg",
    detail: "Changing exhibitions in Fitchburg. See what's on and which days the museum is open.",
    bestFor: "An art afternoon",
    url: "https://fitchburgartmuseum.org/visit/",
    linkLabel: "Visit the museum",
  },
  {
    slug: "gardner-museum",
    name: "The Gardner Museum",
    category: "rain",
    location: "Downtown Gardner",
    detail: "Furniture, local history and the story of Gardner's Chair City roots. Check visiting hours.",
    bestFor: "Chair City history",
    url: "https://www.gardnermuseuminc.com/home/hours",
    linkLabel: "Hours and admission",
  },
  {
    slug: "gardner-cinemas",
    name: "Gardner Cinemas",
    category: "rain",
    location: "Gardner",
    detail: "Movie night without leaving Gardner. Check what's playing.",
    bestFor: "Movie night",
    url: "https://gardnercinemas.com/",
    linkLabel: "Current showtimes",
  },
  {
    slug: "wachusett-ski",
    name: "Wachusett Mountain Ski Area",
    category: "seasonal",
    location: "Princeton / Westminster",
    detail: "Skiing and snowboarding when the mountain is open. Snow report first, plans second.",
    bestFor: "A snow day",
    url: "https://www.wachusett.com/the-mountain/your-visit/snow-report/",
    linkLabel: "Mountain conditions",
  },
];

export const localResourceLinks = {
  chamberEvents: "https://business.gardnerma.com/events",
  chamberDirectory: "https://business.gardnerma.com/list",
  chamberRestaurants: "https://business.gardnerma.com/list/category/restaurants-1187",
  wachusettStation: "https://www.mbta.com/stops/place-FR-3338",
  fitchburgLine: "https://www.mbta.com/schedules/CR-Fitchburg/line",
  martShuttle: "https://www.mrta.us/schedule-map/wachusett-commuter-shuttle/",
} as const;
