# Lodge Mercantile — representative product photo sources
Updated 2026-11-18

These are **representative category images**, not actual inventory photographs or photographs of branded items currently on sale. Each live product keeps its existing SKU and price; replacing these images cannot change a checkout or inventory count. The original *Puddles and the Council of the Pond* book cover is an in-house asset and is used unaltered. All third-party photos are from Pexels, listed as Free on their individual photo pages and subject to the [Pexels License](https://www.pexels.com/license/). This is not a claim that Pexels photographers endorse the Lodge or that their pictured products are the products sold.

| SKU | Visual subject | Photographer | Original source |
| --- | --- | --- | --- |
| KPL-CRAFT-001 | Stuffed animals | Melike B | https://www.pexels.com/photo/plush-toy-display-with-teddy-bears-and-stuffed-elephant-29279957/ |
| KPL-HAT-001 | Handmade knit hat | Miriam Alonso | https://www.pexels.com/photo/skeins-of-yarn-knitting-needles-and-light-orange-knitted-hat-7585807/ |
| KPL-MITT-001 | Wool mittens | Darya Grey_Owl | https://www.pexels.com/photo/wool-gloves-on-a-wooden-bench-19522473/ |
| KPL-SET-001 | Knit hat & mittens | Alyona Pastukhova | https://www.pexels.com/photo/woman-covering-her-face-with-mittens-14694278/ |
| KPL-SLIP-001 | Handmade slippers | Valentin Ivantsov | https://www.pexels.com/photo/bright-red-handmade-slippers-on-white-background-38816983/ |
| KPL-CANDY-001 | Assorted small candies | Polina Tankilevitch | https://www.pexels.com/photo/colorful-candy-5469042/ |
| KPL-COOKIE-001 | Cookies & biscuits | James Collington | https://www.pexels.com/photo/golden-crunchy-biscuits-on-a-plate-30403208/ |
| KPL-CHIP-001 | Potato chips in a bag | Srattha Nualsate | https://www.pexels.com/photo/delicious-potato-chips-13060681/ |
| KPL-CANDY-002 | Chocolate candy treats | Alena Shekhovtcova | https://www.pexels.com/photo/various-yummy-chocolate-candies-scattered-on-table-with-glitters-6940979/ |
| KPL-SNACK-002 | Larger chips | Srattha Nualsate | https://www.pexels.com/photo/close-up-shot-of-potato-chips-13060695/ |

Puddles Book 1 and the bundle use the original book cover at `public/images/kpl/mercantile/puddles-council-of-the-pond-cover.png`. The bundle pairs the cover with the representative stuffed-animal photo. The existing photo of the actual physical shelf remains visible only in the storefront intro, and is also a fallback if an external representative photo fails.

Implementation: `lib/mercantile-representative-photos.mjs`. The URLs are fixed, licensed photos rather than random image lookups. **Current limitation:** image assets are served from Pexels CDN, so image availability depends on the external service. If unreliable, replace them with verified local files under this same SKU mapping.

Production gate remains unchanged: Massachusetts in-person pickup tax sourcing for guests using out-of-state billing addresses needs confirmation. No code changes here reconcile manual Stripe Payment Link purchases into PuddleJumper inventory.
