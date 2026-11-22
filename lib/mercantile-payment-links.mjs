// Existing live Stripe Payment Links for the small self-serve Lodge Mercantile.
// This is a *display-only* fallback catalog, not the PuddleJumper stock/order ledger.
// Keep these links disabled outside Vercel production (see app/store/page.tsx).
// Update only after verifying the corresponding product and price in live Stripe.
export const mercantilePaymentLinks = Object.freeze([
  {
    sku: 'KPL-WOOD-001', category: 'Firewood', name: 'Firewood bundle',
    description: 'One bundle for an evening by the firepit.',
    emoji: '🪵', priceCents: 1000,
    stripeUrl: 'https://pay.publiclogic.org/b/fZudRa4hU6Bv31f9SRgYU03',
  },
  {
    sku: 'KPL-CRAFT-001', category: 'Handmade', name: 'Handmade pond friend',
    description: 'Choose a handmade stuffed friend from the basket.',
    emoji: '🧸', priceCents: 2000,
    stripeUrl: 'https://pay.publiclogic.org/b/7sY14o7u6gc59pD3utgYU0d',
  },
  {
    sku: 'KPL-HAT-001', category: 'Handmade', name: 'Handmade hat',
    description: 'One handmade hat in your favorite available color.',
    emoji: '🧶', priceCents: 1200,
    stripeUrl: 'https://pay.publiclogic.org/b/dRm8wQ29M3pj9pDaWVgYU04',
  },
  {
    sku: 'KPL-MITT-001', category: 'Handmade', name: 'Handmade mittens',
    description: 'One pair of handmade mittens.',
    emoji: '🧤', priceCents: 1200,
    stripeUrl: 'https://pay.publiclogic.org/b/8x2aEY5lY2lf7hvghfgYU05',
  },
  {
    sku: 'KPL-SET-001', category: 'Handmade', name: 'Hat & mittens set',
    description: 'One matching hat and mittens set at the bundle price.',
    emoji: '🎁', priceCents: 2000,
    stripeUrl: 'https://pay.publiclogic.org/b/aFafZiaGie3X0T7aWVgYU06',
  },
  {
    sku: 'KPL-SLIP-001', category: 'Handmade', name: 'Handmade slippers',
    description: 'One pair of soft handmade slippers.',
    emoji: '🥿', priceCents: 800,
    stripeUrl: 'https://pay.publiclogic.org/b/bJe5kEeWy1hb6dr2qpgYU07',
  },
  {
    sku: 'KPL-CANDY-001', category: 'Snacks', name: 'Small candy or fruit snacks',
    description: 'One small, individually packaged sweet treat.',
    emoji: '🍬', priceCents: 100,
    stripeUrl: 'https://pay.publiclogic.org/b/dRmfZi9CebVP45jghfgYU08',
  },
  {
    sku: 'KPL-COOKIE-001', category: 'Snacks', name: 'Cookies or crackers',
    description: 'One small, sealed snack pack.',
    emoji: '🍪', priceCents: 125,
    stripeUrl: 'https://pay.publiclogic.org/b/8x2bJ2g0Cf81dFT9SRgYU09',
  },
  {
    sku: 'KPL-CHIP-001', category: 'Snacks', name: 'Standard chips or Cheetos',
    description: 'One standard-size bag from the snack basket.',
    emoji: '🥨', priceCents: 150,
    stripeUrl: 'https://pay.publiclogic.org/b/aFa7sMbKm2lf1Xbd53gYU0a',
  },
  {
    sku: 'KPL-CANDY-002', category: 'Snacks', name: 'Full-size candy or sweet snack',
    description: 'One full-size, individually packaged sweet snack.',
    emoji: '🍫', priceCents: 175,
    stripeUrl: 'https://pay.publiclogic.org/b/5kQ28s7u67Fz9pD2qpgYU0b',
  },
  {
    sku: 'KPL-SNACK-002', category: 'Snacks', name: 'Larger or premium snack',
    description: 'One larger snack bag from the marked basket.',
    emoji: '🥔', priceCents: 225,
    stripeUrl: 'https://pay.publiclogic.org/b/aFa7sM9Ce3pj9pD8ONgYU0c',
  },
].map((product) => Object.freeze(product)));

export const mercantileCategories = Object.freeze([
  { key: 'Firewood', label: 'Firewood' },
  { key: 'Handmade', label: 'Handmade at the Lodge' },
  { key: 'Snacks', label: 'Little treats & snacks' },
]);
