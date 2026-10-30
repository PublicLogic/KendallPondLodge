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
  { id: "all", label: "All our picks" },
  { id: "food", label: "Food & coffee" },
  { id: "outside", label: "Trails & fresh air" },
  { id: "rain", label: "Rainy days" },
  { id: "seasonal", label: "Seasonal" },
];

export const explorePicks: readonly ExplorePick[] = [
  {
    slug: "blue-moon-diner",
    name: "Blue Moon Diner",
    category: "food",
    location: "Downtown Gardner",
    detail: "A classic Worcester lunch-car diner for breakfast or lunch. Good choice when you want a straightforward, local morning.",
    bestFor: "A classic breakfast",
    url: "https://business.gardnerma.com/list/member/blue-moon-diner-1363",
    linkLabel: "Diner details",
  },
  {
    slug: "cafe-edesia",
    name: "Cafe Edesia",
    category: "food",
    location: "Gardner",
    detail: "Coffee, smoothies, breakfast and lunch options. An easy stop before you head out for the day.",
    bestFor: "Coffee and lunch",
    url: "https://cafeedesia.toast.site/",
    linkLabel: "Cafe menu",
  },
  {
    slug: "gardner-ale-house",
    name: "Gardner Ale House",
    category: "food",
    location: "Downtown Gardner",
    detail: "Moon Hill Brewing's downtown restaurant. A relaxed dinner after a day outdoors, with a full pub menu.",
    bestFor: "Dinner out",
    url: "https://www.moonhillbrewing.com/",
    linkLabel: "Restaurant details",
  },
  {
    slug: "sawa",
    name: "Sawa Asian Cuisine & Lounge",
    category: "food",
    location: "Gardner",
    detail: "Japanese and Chinese dishes including sushi. A useful choice for a sit-down meal or takeout back at the Lodge.",
    bestFor: "Sushi or takeout",
    url: "https://www.sawaasiancuisine.com/",
    linkLabel: "Menu and location",
  },
  {
    slug: "wachusett-reservation",
    name: "Wachusett Mountain State Reservation",
    category: "outside",
    location: "Princeton",
    detail: "Hiking trails and big views, with routes for different experience levels. Check the state trail map and current access before you go.",
    bestFor: "A mountain day",
    url: "https://www.mass.gov/locations/wachusett-mountain-state-reservation",
    linkLabel: "Trails and access",
  },
  {
    slug: "dunn-state-park",
    name: "Dunn State Park",
    category: "outside",
    location: "Gardner",
    detail: "An easy local outing with walking paths, picnic spots and a pond. Check seasonal facilities before planning to swim.",
    bestFor: "An easy walk",
    url: "https://www.mass.gov/locations/dunn-state-park",
    linkLabel: "Park details",
  },
  {
    slug: "red-apple-farm",
    name: "Red Apple Farm",
    category: "seasonal",
    location: "Phillipston",
    detail: "A farm store, cider donuts, and seasonal orchard and farm activities. The outing can be as simple as a stop for provisions.",
    bestFor: "A farm stop",
    url: "https://www.redapplefarm.com/",
    linkLabel: "Farm and events",
  },
  {
    slug: "fitchburg-art-museum",
    name: "Fitchburg Art Museum",
    category: "rain",
    location: "Fitchburg",
    detail: "Art and changing exhibitions. A strong indoor choice when the weather won't cooperate; check exhibition and visit details.",
    bestFor: "Art and a rainy afternoon",
    url: "https://fitchburgartmuseum.org/visit/",
    linkLabel: "Visit the museum",
  },
  {
    slug: "gardner-museum",
    name: "The Gardner Museum",
    category: "rain",
    location: "Downtown Gardner",
    detail: "Gardner's local history, including its furniture-making past, in a remarkable historic building.",
    bestFor: "Local history",
    url: "https://www.gardnermuseuminc.com/home/hours",
    linkLabel: "Hours and admission",
  },
  {
    slug: "gardner-cinemas",
    name: "Gardner Cinemas",
    category: "rain",
    location: "Gardner",
    detail: "A simple movie-night option close to town. Check current showtimes before you leave the Lodge.",
    bestFor: "A movie night",
    url: "https://gardnercinemas.com/",
    linkLabel: "Current showtimes",
  },
  {
    slug: "wachusett-ski",
    name: "Wachusett Mountain Ski Area",
    category: "seasonal",
    location: "Princeton / Westminster",
    detail: "Skiing and snowboarding in season, with other mountain events during the year. Always check the current operating report.",
    bestFor: "A winter outing",
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
