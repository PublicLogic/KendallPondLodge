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
  address?: string;
};

export const exploreCategories: readonly { id: "all" | ExploreCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "food", label: "Food & coffee" },
  { id: "outside", label: "Outdoors" },
  { id: "rain", label: "Indoors" },
  { id: "seasonal", label: "Seasonal" },
];

export const explorePicks: readonly ExplorePick[] = [
  { slug:"smiths-cheese", name:"Smith's Country Cheese", category:"food", location:"Winchendon", detail:"Pick a cheese for supper back at the house. If the cheesemakers are working, you can watch through the shop windows.", bestFor:"Farm shop", url:"https://smithscountrycheese.com/visit-the-farm/", linkLabel:"Visit Smith's", address:"20 Otter River Road, Winchendon, MA 01475" },
  { slug:"priscilla-candy", name:"Priscilla Candy Shop", category:"food", location:"Gardner", detail:"Handmade chocolates and French Rolls from the candy shop at 4 Main Street.", bestFor:"Sweet stop", url:"https://www.priscillacandy.com/", linkLabel:"Shop candy", address:"4 Main Street, Gardner, MA 01440" },
  { slug:"gardner-ale-house", name:"Gardner Ale House", category:"food", location:"Downtown Gardner", detail:"The Parker Street stop for Moon Hill beer and dinner in downtown Gardner.", bestFor:"Dinner", url:"https://www.moonhillbrewing.com/", linkLabel:"Explore", address:"74 Parker Street, Gardner, MA 01440" },
  { slug:"red-apple-farm", name:"Red Apple Farm", category:"seasonal", location:"Phillipston", detail:"A Phillipston orchard with a farm shop, cider donuts and a calendar that changes with the growing season.", bestFor:"Farm day", url:"https://www.redapplefarm.com/", linkLabel:"Visit the farm", address:"455 Highland Avenue, Phillipston, MA 01331" },
  { slug:"wachusett-reservation", name:"Wachusett Mountain", category:"outside", location:"Princeton", detail:"Pack lunch and pick your trail before you leave the pond. The state reservation has its own trail map.", bestFor:"Mountain day", url:"https://www.mass.gov/locations/wachusett-mountain-state-reservation", linkLabel:"See trails", address:"Wachusett Mountain State Reservation, Princeton, MA" },
  { slug:"fitness-concepts", name:"Fitness Concepts", category:"rain", location:"Gardner", detail:"If you like to keep your workout routine on vacation, check the class schedule and ask about a guest visit.", bestFor:"Wellness", url:"https://www.fitconcepts.net/", linkLabel:"Visit gym", address:"696 West Broadway, Gardner, MA 01440" },
  { slug:"gardner-pacc", name:"Gardner PACC", category:"seasonal", location:"Kendall Pond", detail:"A community gathering place on Kendall Pond with summer cruise nights, a function hall and a pavilion.", bestFor:"Local events", url:"https://www.gardnerpacc.com/", linkLabel:"See events", address:"171 Kendall Pond West, Gardner, MA 01440" },
  { slug:"gardner-outlet-furniture", name:"Gardner Outlet Furniture", category:"rain", location:"Gardner", detail:"A Timpany Boulevard showroom in the city known for its furniture trade.", bestFor:"Chair City", url:"https://www.gardneroutletfurniture.com/", linkLabel:"Visit showroom", address:"344 Timpany Boulevard, Gardner, MA 01440" },
  { slug:"dunn-state-park", name:"Dunn State Park", category:"outside", location:"Gardner", detail:"Pack a picnic for Dunn Pond. The fishing piers give you a good place to stop along the water.", bestFor:"Easy walk", url:"https://www.mass.gov/locations/dunn-state-park", linkLabel:"Explore park", address:"289 Pearl Street, Gardner, MA 01440" },
  { slug:"blue-moon-diner", name:"Blue Moon Diner", category:"food", location:"Gardner", detail:"A Gardner landmark for a diner breakfast downtown.", bestFor:"Breakfast", url:"https://business.gardnerma.com/list/member/blue-moon-diner-1363", linkLabel:"Diner details", address:"Blue Moon Diner, Gardner, MA" },
  { slug:"cafe-edesia", name:"Cafe Edesia", category:"food", location:"Gardner", detail:"A Gardner café for coffee and breakfast. The menu is linked here for ordering ahead.", bestFor:"Coffee", url:"https://cafeedesia.toast.site/", linkLabel:"Cafe menu", address:"Cafe Edesia, Gardner, MA" },
  { slug:"sawa", name:"Sawa Asian Cuisine & Lounge", category:"food", location:"Gardner", detail:"Sushi and Asian cuisine in Gardner, with takeout for guests dining back at the lodge.", bestFor:"Takeout", url:"https://www.sawaasiancuisine.com/", linkLabel:"See menu", address:"Sawa Asian Cuisine, Gardner, MA" },
  { slug:"fitchburg-art-museum", name:"Fitchburg Art Museum", category:"rain", location:"Fitchburg", detail:"Plan your visit around the current exhibitions. The museum is a reason to spend an afternoon in Fitchburg.", bestFor:"Art", url:"https://fitchburgartmuseum.org/visit/", linkLabel:"Visit museum", address:"185 Elm Street, Fitchburg, MA 01420" },
  { slug:"gardner-museum", name:"The Gardner Museum", category:"rain", location:"Gardner", detail:"Wondering why Gardner is called Chair City? Start here, and check the museum’s opening hours.", bestFor:"Local history", url:"https://www.gardnermuseuminc.com/home/hours", linkLabel:"Visit museum", address:"The Gardner Museum, Gardner, MA" },
  { slug:"gardner-cinemas", name:"Gardner Cinemas", category:"rain", location:"Gardner", detail:"An easy rainy-night plan. Pick a showtime before heading down Timpany Boulevard.", bestFor:"Movie night", url:"https://gardnercinemas.com/", linkLabel:"See showtimes", address:"Gardner Cinemas, Gardner, MA" },
  { slug:"wachusett-ski", name:"Wachusett Mountain Ski Area", category:"seasonal", location:"Princeton", detail:"Check the snow report over breakfast before you load the skis into the car.", bestFor:"Snow day", url:"https://www.wachusett.com/the-mountain/your-visit/snow-report/", linkLabel:"Snow report", address:"499 Mountain Road, Princeton, MA 01541" },
  { slug:"monument-park", name:"Monument Park", category:"outside", location:"Gardner", detail:"Bring a coffee and take a seat by the bandstand for a quiet break downtown.", bestFor:"Slow afternoon", url:"https://www.gardner-ma.gov/Facilities/Facility/Details/Monument-Park-5", linkLabel:"Park information", address:"1 Cottage Street, Gardner, MA 01440" },
];
export const localResourceLinks = {
  chamberEvents: "https://business.gardnerma.com/events",
  chamberDirectory: "https://business.gardnerma.com/list",
  chamberRestaurants: "https://business.gardnerma.com/list/category/restaurants-1187",
  wachusettStation: "https://www.mbta.com/stops/place-FR-3338",
  fitchburgLine: "https://www.mbta.com/schedules/CR-Fitchburg/line",
  martShuttle: "https://www.mrta.us/schedule-map/wachusett-commuter-shuttle/",
} as const;
