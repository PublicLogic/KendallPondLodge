# Kendall Pond aerial background artwork — release gate

## Scope

The owner shared three aerial photographs of Kendall Pond on October 29, 2026. They show the broader public pond, not solely the Lodge or its private rental property. The owner explicitly said the photographs are **not theirs**. A pond's public status does not grant copyright permission for photographs of it.

**Do not publish or commit the supplied files to this public repository, or enable them in Vercel, without confirming an appropriate license or written permission from the copyright owner.** Attribution by itself is not permission.

## Asset mapping after rights clearance

| Supplied image | Destination (in `public/images/kpl/pond-aerials/`) | Use |
| --- | --- | --- |
| `KP3.webp` | `kp3-autumn-wide.webp` | Home: full-width scenic interlude |
| `KP2.webp` | `kp2-autumn-shoreline.webp` | Waterfront: scenic interlude |
| `KENDALL-POND.webp` | `kendall-pond-autumn-overlook.webp` | Explore: scenic interlude |

Use the WebP originals or optimized derivatives only after rights have been documented. Keep source/photographer and applicable license terms in the asset record; apply any required credit.

## Activation

1. Document the source and explicit rights for commercial website use, derivative crops, and any required attribution.
2. Add the three approved assets at the paths above. Check mobile/desktop cropping, compressed sizes, contrast, and placement.
3. Only then set server-side `KPL_POND_AERIAL_RIGHTS_CLEARED=true` for the deployment.
4. Check the live Home, Waterfront, and Explore pages; confirm they do not suggest the Lodge owns all of Kendall Pond.
5. Leave `/owner`, `/book`, STAY/PuddleJumper, pricing, calendar, checkout, and API behavior unchanged.

Until all of the above, the component serves existing KPL-owned photographs as safe fallbacks. The supplied aerials are intentionally **not** in the repository.

## Placement rule

Treat aerials as atmospheric backgrounds and geographically broad context, not as evidence of private property limits, guest amenities, or the Lodge's exact location. They do not enter the 50-image property gallery or the listing hero.
