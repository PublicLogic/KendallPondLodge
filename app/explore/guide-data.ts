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
    detail: "Breakfast and lunch served in a classic Worcester Lunch Car diner.",
    bestFor: "Breakfast & lunch",
    url: "https://business.gardnerma.com/list/member/blue-moon-diner-1363",
    linkLabel: "Diner details",
  },
  {
    slug: "cafe-edesia",
    name: "Cafe Edesia",
    category: "food",
    location: "Gardner",
    detail: "Coffee, smoothies, breakfast and lunch in Gardner.",
    bestFor: "Coffee & lunch",
    url: "https://cafeedesia.toast.site/",
    linkLabel: "Cafe menu",
  },
  {
    slug: "gardner-ale-house",
    name: "Gardner Ale House",
    category: "food",
    location: "Downtown Gardner",
    detail: "Moon Hill Brewing's downtown Gardner restaurant and brewpub.",
    bestFor: "Dinner",
    url: "https://www.moonhillbrewing.com/",
    linkLabel: "Restaurant details",
  },
  {
    slug: "sawa",
    name: "Sawa Asian Cuisine & Lounge",
    category: "food",
    location: "Gardner",
    detail: "Japanese and Chinese dishes, including sushi. Dine in or order takeout.",
    bestFor: "Sushi & takeout",
    url: "https://www.sawaasiancuisine.com/",
    linkLabel: "Menu and location",
  },
  {
    slug: "wachusett-reservation",
    name: "Wachusett Mountain State Reservation",
    category: "outside",
    location: "Princeton",
    detail: "Hiking trails, summit views and seasonal access information from the state parks department.",
    bestFor: "Hiking",
    url: "https://www.mass.gov/locations/wachusett-mountain-state-reservation",
    linkLabel: "Trails and access",
  },
  {
    slug: "dunn-state-park",
    name: "Dunn State Park",
    category: "outside",
    location: "Gardner",
    detail: "Walking trails around Dunn Pond and picnic areas. Check seasonal facility access.",
    bestFor: "Walking",
    url: "https://www.mass.gov/locations/dunn-state-park",
    linkLabel: "Park details",
  },
  {
    slug: "red-apple-farm",
    name: "Red Apple Farm",
    category: "seasonal",
    location: "Phillipston",
    detail: "Farm store, cider donuts and seasonal orchard activities in Phillipston.",
    bestFor: "Farm & orchard",
    url: "https://www.redapplefarm.com/",
    linkLabel: "Farm and events",
  },
  {
    slug: "fitchburg-art-museum",
    name: "Fitchburg Art Museum",
    category: "rain",
    location: "Fitchburg",
    detail: "Art exhibitions in Fitchburg. Check current exhibitions and visiting hours.",
    bestFor: "Art",
    url: "https://fitchburgartmuseum.org/visit/",
    linkLabel: "Visit the museum",
  },
  {
    slug: "gardner-museum",
    name: "The Gardner Museum",
    category: "rain",
    location: "Downtown Gardner",
    detail: "Local history, including Gardner's furniture-making past, in a historic building.",
    bestFor: "Local history",
    url: "https://www.gardnermuseuminc.com/home/hours",
    linkLabel: "Hours and admission",
  },
  {
    slug: "gardner-cinemas",
    name: "Gardner Cinemas",
    category: "rain",
    location: "Gardner",
    detail: "A movie theater in Gardner. Check showtimes and tickets.",
    bestFor: "Movies",
    url: "https://gardnercinemas.com/",
    linkLabel: "Current showtimes",
  },
  {
    slug: "wachusett-ski",
    name: "Wachusett Mountain Ski Area",
    category: "seasonal",
    location: "Princeton / Westminster",
    detail: "Skiing and snowboarding in season. Check current mountain conditions and operating hours.",
    bestFor: "Skiing",
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
