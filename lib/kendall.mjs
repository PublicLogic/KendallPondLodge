export const GUIDE_ENTRIES = [
  {
    title: "What is the KPL Guidebook?",
    keywords: ["kpl lodge kendall pond property stay welcome guide guidebook"],
    answer:
      "The Guidebook is the private active-stay experience for the Lodge at Kendall Pond. It keeps approved house, waterfront, safety, audio, and checkout guidance in one calm place.",
    href: "/guidebook",
    linkLabel: "Open the Guidebook",
  },
  {
    title: "Arrival and entry",
    keywords: ["arrive arrival address directions entry access door code check in checkin time"],
    answer:
      "Use the latest private message in your booking app for the address, directions, entry instructions, access code, and confirmed arrival time. Those details are not published here.",
    href: "/guidebook/arrival",
    linkLabel: "Arrival guide",
  },
  {
    title: "Wi-Fi and television",
    keywords: ["wifi wi-fi internet network password tv television streaming roku"],
    answer:
      "Current Wi-Fi and television instructions are provided privately with your stay. Sign out of personal streaming accounts before checkout.",
    href: "/guidebook/house",
    linkLabel: "House essentials",
  },
  {
    title: "Heating and cooling",
    keywords: ["heat heating cold air cooling thermostat temperature comfort hot"],
    answer:
      "Keep doors and windows closed while heating or cooling is running. If the house will not reach a comfortable temperature, message the hosts instead of forcing a control.",
    href: "/guidebook/house",
    linkLabel: "House essentials",
  },
  {
    title: "Pond and boat safety",
    keywords: ["pond lake water swim swimming boat boats kayak paddle life jacket storm wind dock"],
    answer:
      "Wear a properly fitted life jacket in a kayak or paddle boat, never swim or boat alone, supervise children directly, and stay ashore in storms, high wind, poor visibility, or unsafe conditions.",
    href: "/guidebook/waterfront",
    linkLabel: "Waterfront guide",
  },
  {
    title: "Using the hot tub",
    keywords: ["hot tub hottub spa jets cover error water chemical controls"],
    answer:
      "Shower first, use only the normal controls, and replace the cover after use. Do not add products or force jets, caps, or valves. Stop and message the hosts if the water looks unsafe or a warning appears.",
    href: "/guidebook/outside#hot-tub",
    linkLabel: "Hot tub guidance",
  },
  {
    title: "Fire pit and fireworks",
    keywords: ["fire firepit fire pit wood burn burning fireworks outside"],
    answer:
      "Use the fire pit only when conditions and local rules allow, keep water nearby, supervise it continuously, and extinguish it fully. Fireworks are not permitted.",
    href: "/guidebook/outside#fire-pit",
    linkLabel: "Outdoor guide",
  },
  {
    title: "Pool safety",
    keywords: ["pool swimming dive diving glass child children"],
    answer:
      "Use the pool only when it is available for your stay. No diving, glass, or unsupervised children, and follow any posted instructions.",
    href: "/guidebook/outside#pool",
    linkLabel: "Outdoor guide",
  },
  {
    title: "Children and pets",
    keywords: ["child children kid kids baby dog dogs pet pets supervision"],
    answer:
      "Actively supervise children around the pond, dock, pool, hot tub, fire pit, stairs, and road. Follow the pet terms included with your reservation.",
    href: "/guidebook/house#children-pets",
    linkLabel: "House essentials",
  },
  {
    title: "Emergency help",
    keywords: ["emergency hurt injury injured fire medical danger 911 help accident"],
    answer:
      "Call 911 for a fire, medical, water, or immediate safety emergency. Use the booking app for property help that is not an emergency.",
    href: "/guidebook",
    linkLabel: "Guidebook home",
  },
  {
    title: "Checkout",
    keywords: ["checkout check out leave leaving departure clean trash boats gear sign out"],
    answer:
      "Use the confirmed checkout time in your booking message. Return gear, secure the hot-tub cover, close windows and doors, take your belongings, sign out of personal accounts, and report damage or problems.",
    href: "/guidebook/checkout",
    linkLabel: "Checkout list",
  },
  {
    title: "House audio and Bluetooth",
    keywords: ["audio music speaker speakers bluetooth alexa echo pair connect play pause volume command cli"],
    answer:
      "Pair the house speaker in your phone or computer Bluetooth settings, then open House audio to select the output and play a local audio file. Audio stays on your device.",
    href: "/guidebook/audio",
    linkLabel: "House audio",
  },
  {
    title: "KPL Remote and PJ Bridge",
    keywords: ["remote app control camera lock device roku ring thermostat bridge pj tools status"],
    answer:
      "KPL Remote is a side tool inside the Guidebook, not the main feature. Browser audio works now. Direct property controls appear only after the on-site PJ Bridge and each approved device adapter are installed and verified.",
    href: "/guidebook/remote",
    linkLabel: "Open Remote status",
  },
];

const FALLBACK = {
  kind: "fallback",
  title: "That is not in the Guidebook yet.",
  answer:
    "Try a house, pond, audio, hot tub, checkout, or safety question. For stay-specific help, message the hosts through the booking app.",
  href: "/guidebook",
  linkLabel: "Guidebook home",
};

export function normalize(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchGuide(question, entries = GUIDE_ENTRIES) {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "about",
    "are",
    "can",
    "do",
    "for",
    "how",
    "i",
    "if",
    "in",
    "is",
    "it",
    "my",
    "me",
    "of",
    "on",
    "the",
    "tell",
    "to",
    "what",
    "where",
    "who",
  ]);
  const terms = [
    ...new Set(
      normalize(question)
        .split(" ")
        .filter((term) => term.length > 1 && !stopWords.has(term)),
    ),
  ];

  if (!terms.length) return FALLBACK;

  const ranked = entries
    .map((entry) => {
      const title = normalize(entry.title);
      const keywords = normalize(entry.keywords.join(" "));
      const answer = normalize(entry.answer);
      const keywordSet = new Set(keywords.split(" "));
      const score = terms.reduce(
        (total, term) =>
          total +
          (keywordSet.has(term) ? 6 : 0) +
          (title.includes(term) ? 3 : 0) +
          (answer.includes(term) ? 1 : 0),
        0,
      );
      return { ...entry, score };
    })
    .sort((a, b) => b.score - a.score);

  if (!ranked[0] || ranked[0].score < 3) return FALLBACK;
  const { title, answer, href, linkLabel } = ranked[0];
  return { kind: "answer", title, answer, href, linkLabel };
}
