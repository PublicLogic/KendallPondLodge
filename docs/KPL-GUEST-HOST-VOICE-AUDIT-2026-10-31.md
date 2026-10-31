# Lodge at Kendall Pond — guest-facing site review
**October 31, 2026 · Source review of the public site and private guest guide**

## The experience we want

A genuinely beautiful, whole waterfront house hosted by Nate and Allie, who live nearby and know the place. Warm without being gushy; polished without being corporate. Guests should feel they can arrive, settle in, and get help from real people if they need it.

**Lead with:** actual property photography, clear rooms and amenities, availability and full pricing, the hosts' accessibility, and a simple guest guide.

**Avoid:** generic luxury adjectives, repeated three-word slogans, self-congratulation, software product vocabulary, staged or reconstructed-looking photographs, and promises that aren't confirmed.

## Reviewed surfaces

- Home, Lodge, Waterfront/Grounds, Photos, Explore
- Booking, Rates, wedding/event stays, and travel/area information
- Guest guide access, dashboard, arrival, house, outdoor care, waterfront, audio, and checkout
- Shared booking/FAQ copy, review disclosure, host messages, public header/footer and image provenance

## Corrections prepared on this branch

1. Replaced mechanical homepage listing/headlines with more specific, host-voiced copy and the actual seasonal deck photo in the property gallery.
2. Removed an immediately repeated great-room image from the Lodge tour and made the lower-level description more useful.
3. Removed defensive photo language and unnecessary repeated descriptions across house, grounds and Explore.
4. Corrected old public-facing manual-quote wording on Rates, travel, events and FAQ surfaces to match the active price-first checkout path, without modifying booking safeguards.
5. Replaced technical wording such as "command center," "Not AI," "public-safe by design," and guest-facing device roadmap sections with practical instructions and a human help path.
6. Used original or documented non-generative Lodge photographs on the main marketing pages in place of the separate AI-retouched deck/exterior assets.
7. Made the public STAY booking-platform footer attribution smaller without removing required credit.
8. Updated checks that previously enforced outdated copy or AI-retouched imagery.

## Remaining truth and UX checks before calling the site exemplary

**Verify the pool.** The private house, arrival and outdoor guide refer to a pool, while the current main public amenity descriptions emphasize the pond and hot tub. Confirm that a pool exists and is available on the stated terms; if not, remove the instructions. This branch avoids inventing an answer.

**Map trust.** Explore currently uses an explicitly labeled schematic overview, not a real road map. Its browser-side geocoding can omit places when lookup is unavailable. The names and links remain helpful, but the map needs a separate reliability/accuracy review before promoting it as a real navigation tool.

**Local business photography.** Most place cards still lack authentic, documented photos. Remote third-party links may be blocked, outdated or not licensed for reuse. Use permissioned, venue-specific photographs or a restrained non-photographic tile. Do not imply an unrelated photo depicts a business.

**Booking friction.** The current date-first booking form still requests name and email before showing a price. This may weaken the fast direct-booking experience. Test with real guests and don't alter checkout or inventory gates just for a copy improvement.

**Review data.** The public review snapshot is dated October 27, 2026. Retain its visible as-of date and refresh against Airbnb when there is a real verified change; never fabricate a score or "Guest Favorite" award.

**Photo and device verification.** Confirm each public image represents the actual house and season, particularly newly edited ones. Confirm the guest guide's proposed music workflow works on real guest devices.

## Verification limits

This is a source-level audit and edit set, not a passed visual/browser QA. The public domain could not be inspected from the current browsing environment. Before publishing, visually check the current Vercel preview on a narrow phone and wide desktop, including the header, photos, CTAs, page scrolling, booking fallback, guest-guide access and legibility. Do not change prices, owner controls, guest secrets, or checkout safeguards to solve editorial issues.

## Editorial acceptance test

Every sentence should answer at least one of these questions:
1. What is this room or feature, and where is it?
2. What will a guest need to know before arriving or using it?
3. How do I check dates and see the real total?
4. How do I get help from Nate and Allie?

If a sentence answers none of them, it probably doesn't belong on the site.
