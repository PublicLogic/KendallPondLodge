# Kendall Pond aerial background artwork — release gate

## Scope

The owner shared three aerial photographs of Kendall Pond on October 29, 2026. They show the broader public pond, not solely the Lodge or its private rental property. The owner explicitly said the photographs are **not theirs**. A pond's public status does not grant copyright permission for photographs of it.

**Do not publish or commit the supplied files to this public repository, or enable them in Vercel, without confirming an appropriate license or written permission from the copyright owner.** Attribution by itself is not permission.

## Asset mapping after rights clearance

| Supplied image | Destination (in `public/images/kpl/pond-aerials/`) | Use |
| --- | --- | --- |
| `KP3.webp` | `kp3-autumn-wide.webp` | Home: visible-but-secondary decorative texture behind the existing bottom booking call-to-action |
| `KP2.webp` | `kp2-autumn-shoreline.webp` | Waterfront: visible-but-secondary decorative texture behind the existing shoreline information |
| `KENDALL-POND.webp` | `kendall-pond-autumn-overlook.webp` | Explore: visible-but-secondary decorative texture behind the existing booking call-to-action |

Use the WebP originals or optimized derivatives only after rights have been documented. Keep source/photographer and applicable license terms in the asset record; apply any required credit.

## Activation

1. Document the source and explicit rights for commercial website use, derivative crops, and any required attribution.
2. Add the three approved assets at the paths above. Check mobile/desktop cropping, compressed sizes, contrast, and placement.
3. Only then set server-side `KPL_POND_AERIAL_RIGHTS_CLEARED=true` for the deployment.
4. Check the live Home, Waterfront, and Explore pages; confirm they do not suggest the Lodge owns all of Kendall Pond.
5. Leave `/owner`, `/book`, STAY/PuddleJumper, pricing, calendar, checkout, and API behavior unchanged.

Until all of the above, the component serves existing KPL-owned photographs as safe fallbacks. The supplied aerials are intentionally **not** in the repository.

## Placement rule

Treat aerials as low-opacity, cropped edge textures behind **existing** content, not as evidence of property limits, amenities, or the Lodge's exact location.

**Hierarchy requirement:** the Lodge's actual photos (house, deck, hot tub, private dock and interiors), its story, and the booking controls are the visual centerpiece. The supplied aerials must **not** appear as hero images, full-width scenic interludes, foreground cards, photo-gallery items, or prominent marketing images. The ambient component must not add height, headings, buttons, or other sections.

The revised preview uses 31% image opacity on desktop / 20% on mobile, but an edge-gradient mask reduces the effective coverage and keeps the image behind existing content. No new hero, standalone scene or additional page height. Any future edit making these images prominent requires a separate review.
