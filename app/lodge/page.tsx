import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { lodgePhoto, type LodgePhoto } from "@/app/_data/lodge-photos";
import { SleepPlan } from "@/app/_components/StayInformation";
import stay from "@/app/_data/public-stay.json";
import { hostContactHref } from "@/lib/booking-db";
import styles from "./lodge.module.css";

export const metadata: Metadata = {
  title: "Inside the Lodge | Bedrooms, Living Spaces & Waterfront",
  alternates: { canonical: "/lodge" },
  description: "Explore the whole house at Kendall Pond: three bedrooms, two full baths, a kitchen, fireplaces, an upper deck and a private waterfront yard. Room for up to eight guests.",
};

// All photographs come from the Lodge's curated property collection.
const photos = {
  arrival: lodgePhoto(7),
  living: lodgePhoto(5),
  kitchen: lodgePhoto(17),
  dining: lodgePhoto(19),
  downstairs: lodgePhoto(13),
  woodBedroom: lodgePhoto(25),
  blueBedroom: lodgePhoto(23),
  bunkRoom: lodgePhoto(27),
  deck: lodgePhoto(31),
  hotTub: lodgePhoto(37),
  grounds: lodgePhoto(6),
  autumn: lodgePhoto(2),
};
const halfSize = "(max-width: 700px) calc(100vw - 36px), (max-width: 1376px) calc((100vw - 128px) / 2), 624px";

function Photograph({ photo, caption, detail, sizes = halfSize, priority = false, className = "" }: {
  photo: LodgePhoto;
  caption: string;
  detail?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={styles.photo + (className ? " " + className : "")}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
      />
      <figcaption>
        <span>{caption}</span>
        {detail && <span className={styles.captionDetail}>{detail}</span>}
      </figcaption>
    </figure>
  );
}

export default function LodgePage() {
  return (
    <main id="main-content" className={styles.page} data-lodge-editorial>
      <section className={styles.cover} aria-labelledby="lodge-title" data-retreat-hero data-lodge-cover>
        <Photograph
          photo={photos.arrival}
          caption="The Lodge, from the waterfront lawn"
          detail="Gardner, Massachusetts"
          sizes="100vw"
          priority
          className={styles.coverPhotograph}
        />
        <div className={styles.coverShade} aria-hidden="true" />
        <div className={styles.container + " " + styles.coverInner}>
          <p className={styles.coverLocation}>The Lodge at Kendall Pond <span>Gardner, Massachusetts</span></p>
          <div className={styles.coverStory}>
            <p className={styles.eyebrow}>Inside the Lodge</p>
            <h1 id="lodge-title">The house<br /><em>is yours.</em></h1>
            <p className={styles.coverIntro}>Three bedrooms, two full baths, and room for eight. The kitchen, two lounges, deck, and covered patio are all part of your stay.</p>
            <div className={styles.actions}>
              <Link className={styles.button} href="/book">Check your dates <span aria-hidden="true">↗</span></Link>
              <a className={styles.coverTextLink} href="#living">Come inside <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className={styles.coverFoot}><span>Hosted locally by Nate &amp; Allie</span><span>The house. The yard. The waterfront.</span></div>
        </div>
      </section>

      <section className={styles.container + " " + styles.overview} aria-label="The house at a glance">
        <dl className={styles.facts}>
          <div><dt>Guests</dt><dd>Up to {stay.maxGuests}</dd></div>
          <div><dt>Bedrooms</dt><dd>{stay.bedrooms} bedrooms</dd></div>
          <div><dt>Bathrooms</dt><dd>{stay.bathrooms} full baths</dd></div>
          <div><dt>Your stay</dt><dd>The whole house</dd></div>
        </dl>
        <nav className={styles.jumpNav} aria-label="Explore the Lodge">
          <a href="#living">Living &amp; dining</a>
          <a href="#downstairs">Downstairs</a>
          <a href="#sleeping">Bedrooms</a>
          <a href="#outside">Deck &amp; waterfront</a>
          <a href="#house-details">House details</a>
        </nav>
      </section>

      <section id="living" className={styles.container + " " + styles.section} aria-labelledby="living-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.eyebrow}>The main level</p><h2 id="living-title">Dinner together.<br />Fireplace after.</h2></div>
          <p>The kitchen, dining area, and great room open into one another. Tall windows, a cathedral ceiling, and plenty of room around the fireplace.</p>
        </div>
        <div className={styles.livingGrid}>
          <Photograph
            photo={photos.living}
            caption="The great room"
            detail="Cathedral ceiling · fireplace"
            sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1376px) 53vw, 710px"
            className={styles.livingLead}
          />
          <div className={styles.livingStack}>
            <Photograph photo={photos.kitchen} caption="The kitchen" detail="Breakfast bar · room to cook" sizes="(max-width: 700px) calc(100vw - 36px), 38vw" />
            <Photograph photo={photos.dining} caption="The dining room" detail="Table beside the kitchen" sizes="(max-width: 700px) calc(100vw - 36px), 38vw" />
          </div>
        </div>
      </section>

      <section id="downstairs" className={styles.container + " " + styles.section + " " + styles.downstairs} aria-labelledby="downstairs-title">
        <div className={styles.downstairsGrid}>
          <div className={styles.downstairsCopy}>
            <p className={styles.eyebrow}>The lower level</p>
            <h2 id="downstairs-title">Downstairs has<br />its own lounge.</h2>
            <p>Downstairs has a second lounge, another fireplace, and doors that open toward the covered patio and the pond.</p>
            <p className={styles.smallNote}>A little more room when everyone doesn't want to do the same thing.</p>
          </div>
          <Photograph photo={photos.downstairs} caption="The downstairs lounge" detail="Second fireplace · walkout patio" sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1376px) 60vw, 760px" />
        </div>
      </section>

      <section id="sleeping" className={styles.sleeping} aria-labelledby="sleeping-title">
        <div className={styles.container}>
          <div className={styles.roomLead}>
            <Photograph photo={photos.woodBedroom} caption="The wood-floor bedroom" detail="White bedding · folded towels" sizes="(max-width: 900px) calc(100vw - 36px), (max-width: 1376px) 58vw, 770px" />
            <div className={styles.roomCopy}>
              <p className={styles.eyebrow}>The bedrooms</p>
              <h2 id="sleeping-title">Three bedrooms.<br />Room for eight.</h2>
              <p>A king bedroom, a queen bedroom, and a twin-over-full bunk room. There is also a queen sleeper sofa for groups who need another sleeping arrangement.</p>
              <p className={styles.smallNote}>Eight overnight guests maximum. The sofa is additional sleeping space, not a fourth bedroom.</p>
              <a className={styles.textLink} href="#sleeping-plan">See the sleeping plan <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className={styles.roomPair}>
            <Photograph photo={photos.blueBedroom} caption="The blue-throw bedroom" detail="White bedding · tiled floor" />
            <Photograph photo={photos.bunkRoom} caption="The bunk room" detail="Twin over full" />
          </div>
          <div id="sleeping-plan" className={styles.sleepPlan}><h3>The sleeping plan</h3><SleepPlan /></div>
        </div>
      </section>

      <section id="outside" className={styles.container + " " + styles.section} aria-labelledby="outside-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.eyebrow}>The deck, patio &amp; shoreline</p><h2 id="outside-title">The deck and<br />the hot tub.</h2></div>
          <div><p>Outdoor dining on the deck. A covered hot tub downstairs. Then the lawn, firepit, dock, and private shoreline.</p><Link className={styles.textLink} href="/grounds">Explore the waterfront <span aria-hidden="true">→</span></Link></div>
        </div>
        <div className={styles.outsideGrid}>
          <Photograph photo={photos.deck} caption="The upper deck" detail="Outdoor dining · pond view" />
          <Photograph photo={photos.hotTub} caption="The covered hot tub" detail="Downstairs · patio" />
          <Photograph photo={photos.grounds} caption="The lawn and shoreline" detail="Firepit · dock" />
          <Photograph photo={photos.autumn} caption="Autumn by the water" detail="Private waterfront" />
        </div>
        <p className={styles.smallNote}>Dock use and outdoor equipment depend on the season and conditions. Children and pets need close supervision by the water.</p>
      </section>

      <section id="house-details" className={styles.container + " " + styles.details} aria-labelledby="details-title">
        <div>
          <p className={styles.eyebrow}>The practical stuff</p>
          <h2 id="details-title">Good to know<br />before you book.</h2>
          <a className={styles.textLink} href={hostContactHref()}>Ask Nate &amp; Allie <span aria-hidden="true">↗</span></a>
        </div>
        <dl className={styles.detailsList}>
          <div><dt>Two full bathrooms</dt><dd>Both have bathing facilities. Ask about the layout if access matters for your group.</dd></div>
          <div><dt>Two levels</dt><dd>There is a main level and a lower walkout level, plus stairs. Contact us about mobility needs before booking.</dd></div>
          <div><dt>Kitchen &amp; laundry</dt><dd>A full kitchen, indoor and outdoor dining areas, and laundry at the house.</dd></div>
          <div><dt>Two fireplaces</dt><dd>One upstairs and one downstairs.</dd></div>
          <div><dt>Parking</dt><dd>Free parking in the driveway. Let us know if your group is bringing multiple vehicles.</dd></div>
          <div><dt>Pets</dt><dd>Up to {stay.maxPets} pets. Include them when booking so the correct terms and any fees are shown.</dd></div>
        </dl>
      </section>

      <section className={styles.close} aria-labelledby="dates-title">
        <div className={styles.container + " " + styles.closeInner}>
          <div><p className={styles.eyebrow}>Hosted by Nate &amp; Allie</p><h2 id="dates-title">Find a few<br />nights that work.</h2><p>Choose your dates, check what is available, and review the full price and terms before you decide.</p></div>
          <div className={styles.closeActions}>
            <Link className={styles.button} href="/book">Check your dates <span aria-hidden="true">↗</span></Link>
            <Link className={styles.textLink} href="/photos">See all the Lodge photos <span aria-hidden="true">→</span></Link>
            <p>Already booked? <Link href="/guidebook">Open the Guest Guide</Link>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
