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
  mapsQuery: string;
  image: { src: string; alt: string; credit: string; sourceUrl: string };
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
    mapsQuery: "Blue Moon Diner, 102 Main Street, Gardner MA",
    image: {
      src: "https://img1.wsimg.com/isteam/ip/9216a751-4145-4c1d-8237-13388cce2d2f/1%20Blue%20Moon%20Diner%20today.jpg",
      alt: "Blue Moon Diner's cream-and-blue lunch-car exterior in downtown Gardner",
      credit: "The Gardner Scene",
      sourceUrl: "https://thegardnerscene.com/f/blue-moon-diner-marks-70-years-in-gardner",
    },
    name: "Blue Moon Diner",
    category: "food",
    location: "Downtown Gardner",
    detail: "A Worcester Lunch Car right on Main Street. Breakfast, lunch, and a little piece of Gardner history.",
    bestFor: "Breakfast & lunch",
    url: "https://business.gardnerma.com/list/member/blue-moon-diner-1363",
    linkLabel: "Diner details",
  },
  {
    slug: "cafe-edesia",
    mapsQuery: "Cafe Edesia, 486 Chestnut Street, Gardner MA",
    image: {
      src: "https://www.localcoffeeshops.org/static/img/shop/massachusetts-gardner-edesia-cafe.jpeg",
      alt: "Cafe Edesia's seating area and pendant lights",
      credit: "Local Coffee Shops",
      sourceUrl: "https://www.localcoffeeshops.org/shop/massachusetts/gardner/edesia-cafe",
    },
    name: "Cafe Edesia",
    category: "food",
    location: "Gardner",
    detail: "Coffee and breakfast on Chestnut Street. Grab something before heading out for the day.",
    bestFor: "Coffee & lunch",
    url: "https://cafeedesia.toast.site/",
    linkLabel: "Cafe menu",
  },
  {
    slug: "gardner-ale-house",
    mapsQuery: "Gardner Ale House, 74 Parker Street, Gardner MA",
    image: {
      src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/55/ff/63/gardner-ale-house.jpg?h=1200&s=1&w=1200",
      alt: "Gardner Ale House restaurant facade and sign on Parker Street",
      credit: "Tripadvisor",
      sourceUrl: "https://www.tripadvisor.ca/Restaurant_Review-g41576-d1020338-Reviews-Moon_Hill_Brewing_and_Gardner_Ale_House-Gardner_Massachusetts.html",
    },
    name: "Gardner Ale House",
    category: "food",
    location: "Downtown Gardner",
    detail: "Pub food and Moon Hill beer on Parker Street. A downtown dinner when nobody feels like cooking.",
    bestFor: "Dinner",
    url: "https://www.moonhillbrewing.com/",
    linkLabel: "Restaurant details",
  },
  {
    slug: "sawa",
    mapsQuery: "Sawa Asian Cuisine and Lounge, 242 West Broadway, Gardner MA",
    image: {
      src: "https://s.yimg.com/ny/api/res/1.2/OIMIb09z6EZsfP_jlPFGVg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTcyMDtjZj13ZWJw/https%3A/media.zenfs.com/en/the-gardner-news/83c41ef383ae6f86dac676b4351dcc1f",
      alt: "Sawa Asian Cuisine's renovated Gardner dining room with round tables and booths",
      credit: "The Gardner News via Yahoo",
      sourceUrl: "https://www.yahoo.com/lifestyle/sawa-asian-cuisine-opens-location-101304516.html",
    },
    name: "Sawa Asian Cuisine & Lounge",
    category: "food",
    location: "Gardner",
    detail: "Sushi and other Japanese and Chinese dishes on West Broadway. Eat there or bring dinner back to the Lodge.",
    bestFor: "Sushi & takeout",
    url: "https://www.sawaasianma.com/",
    linkLabel: "Menu and location",
  },
  {
    slug: "wachusett-reservation",
    mapsQuery: "Wachusett Mountain State Reservation, Princeton MA",
    image: {
      src: "https://www.bostoncentral.com/pix/pages/129/wachusett-tower.jpg",
      alt: "Rocky Wachusett Mountain summit with observation tower and hikers",
      credit: "BostonCentral",
      sourceUrl: "https://www.bostoncentral.com/hiking-wachusett-mountain",
    },
    name: "Wachusett Mountain State Reservation",
    category: "outside",
    location: "Princeton",
    detail: "Up for a hike? Pick a trail on Wachusett, then check the DCR map and access updates before you go.",
    bestFor: "Hiking",
    url: "https://www.mass.gov/locations/wachusett-mountain-state-reservation",
    linkLabel: "Trails and access",
  },
  {
    slug: "dunn-state-park",
    mapsQuery: "Dunn State Park, 289 Pearl Street, Gardner MA",
    image: {
      src: "https://www.mass.gov/files/styles/embedded_half_width/public/images/2025-05/35021_dunn_boat_access_1_1_small.jpg?itok=OKn985QD",
      alt: "Floating boat-access dock on Dunn Pond surrounded by green woods",
      credit: "Mass.gov",
      sourceUrl: "https://www.mass.gov/info-details/dunn-pond",
    },
    name: "Dunn State Park",
    category: "outside",
    location: "Gardner",
    detail: "Walk by Dunn Pond or pack a picnic. No need to leave Gardner for some fresh air.",
    bestFor: "Walking",
    url: "https://www.mass.gov/locations/dunn-state-park",
    linkLabel: "Park details",
  },
  {
    slug: "red-apple-farm",
    mapsQuery: "Red Apple Farm, 455 Highland Avenue, Phillipston MA",
    image: {
      src: "https://images.squarespace-cdn.com/content/v1/6750ca6b3bccca5a0d530520/ff120278-38c8-4314-99b0-6c22aed650d0/Store1.jpg",
      alt: "Produce and pumpkins inside Red Apple Farm's country store",
      credit: "Red Apple Farm",
      sourceUrl: "https://redapplefarm.com/farm-store",
    },
    name: "Red Apple Farm",
    category: "seasonal",
    location: "Phillipston",
    detail: "Cider doughnuts, the farm store, and seasonal orchard activities. Worth the stop in Phillipston.",
    bestFor: "Farm & orchard",
    url: "https://www.redapplefarm.com/",
    linkLabel: "Farm and events",
  },
  {
    slug: "fitchburg-art-museum",
    mapsQuery: "Fitchburg Art Museum, 185 Elm Street, Fitchburg MA",
    image: {
      src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/a1/47/44/thurston-located-in-the.jpg?h=-1&s=1&w=1200",
      alt: "Red sculpture under the glass-sided bridge at Fitchburg Art Museum",
      credit: "Tripadvisor",
      sourceUrl: "https://www.tripadvisor.com/Attraction_Review-g41569-d601912-Reviews-Fitchburg_Art_Museum-Fitchburg_Massachusetts.html",
    },
    name: "Fitchburg Art Museum",
    category: "rain",
    location: "Fitchburg",
    detail: "See what's on at the Fitchburg Art Museum. Exhibits change, and the museum isn't open every day.",
    bestFor: "Art",
    url: "https://fitchburgartmuseum.org/visit/",
    linkLabel: "Visit the museum",
  },
  {
    slug: "gardner-museum",
    mapsQuery: "Gardner Museum, 28 Pearl Street, Gardner MA",
    image: {
      src: "https://pics4.city-data.com/cpicc/cfiles34101.jpg",
      alt: "Gardner Museum in its historic red-brick Memorial Building",
      credit: "City-Data",
      sourceUrl: "https://www.city-data.com/picfilesc/picc34101.php",
    },
    name: "The Gardner Museum",
    category: "rain",
    location: "Downtown Gardner",
    detail: "Gardner's Chair City history, inside the old brick museum downtown. Check the visiting hours.",
    bestFor: "Local history",
    url: "https://www.gardnermuseuminc.com/home/hours",
    linkLabel: "Hours and admission",
  },
  {
    slug: "gardner-cinemas",
    mapsQuery: "Gardner Cinemas, 336 Timpany Boulevard, Gardner MA",
    image: {
      src: "https://s7.localdatacdn.com/ma/gardner/8134100/original/dNRe3Vu9nH.jpg",
      alt: "Gardner Cinemas marquee and entrance on Timpany Boulevard",
      credit: "Loc8NearMe",
      sourceUrl: "https://www.loc8nearme.com/massachusetts/gardner/gardner-cinemas/8134100/",
    },
    name: "Gardner Cinemas",
    category: "rain",
    location: "Gardner",
    detail: "Catch a movie right on Timpany Boulevard. Check what's playing before you head out.",
    bestFor: "Movies",
    url: "https://gardnercinemas.com/",
    linkLabel: "Current showtimes",
  },
  {
    slug: "wachusett-ski",
    mapsQuery: "Wachusett Mountain Ski Area, 499 Mountain Road, Princeton MA",
    image: {
      src: "https://media.snow-online.de/images/ecu/entity/e_skiresort/ski-resort_wachusett-mountain_n4686-23556-0_l.jpg",
      alt: "Chairlift above a snowy Wachusett Mountain ski run",
      credit: "Snow-Online",
      sourceUrl: "https://www.snow-online.com/ski-resort/wachusett-mountain.html",
    },
    name: "Wachusett Mountain Ski Area",
    category: "seasonal",
    location: "Princeton / Westminster",
    detail: "Skiing and snowboarding on Wachusett when conditions allow. Check the snow report before loading the car.",
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
