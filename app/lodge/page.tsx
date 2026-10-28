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

const photos = {
  arrival: lodgePhoto(7),
  living: lodgePhoto(5),
  kitchen: lodgePhoto(17),
  downstairs: lodgePhoto(13),
  woodBedroom: lodgePhoto(25),
  blueBedroom: lodgePhoto(23),
  bunkRoom: lodgePhoto(27),
  grounds: lodgePhoto(6),
  autumn: lodgePhoto(2),
};
const fullSize = "(max-width: 700px) calc(100vw - 36px), (max-width: 1376px) calc(100vw - 96px), 1280px";
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
    <figure className={`${styles.photo} ${className}`}>
      <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}
        sizes={sizes} priority={priority} loading={priority ? "eager" : "lazy"} />
      <figcaption><span>{caption}</span>{detail && <span className={styles.captionDetail}>{detail}</span>}</figcaption>
    </figure>
  );
}

export default function LodgePage() {
  return (
    <main id="main-content" className={styles.page} data-lodge-editorial>
      <section className={styles.container} aria-labelledby="lodge-title">
        <div className={styles.intro}>
          <div><p className={styles.eyebrow}>The Lodge at Kendall Pond</p><h1 id="lodge-title">The house<br /><em>by the pond.</em></h1></div>
          <div className={styles.introCopy}>
            <p>Three bedrooms, two full baths, and a waterfront yard. The whole house, with room for up to eight.</p>
            <div className={styles.actions}><Link className={styles.button} href="/book">Check your dates <span aria-hidden="true">↗</span></Link><a className={styles.textLink} href="#sleeping">See the bedrooms <span aria-hidden="true">↓</span></a></div>
          </div>
        </div>
        <Photograph photo={photos.arrival} caption="The Lodge, from the waterfront lawn" detail="Gardner, Massachusetts" sizes={fullSize} priority className={styles.arrival} />
        <dl className={styles.facts} aria-label="The house at a glance">
          <div><dt>Guests</dt><dd>Up to {stay.maxGuests}</dd></div><div><dt>Bedrooms</dt><dd>{stay.bedrooms} bedrooms</dd></div><div><dt>Bathrooms</dt><dd>{stay.bathrooms} full baths</dd></div><div><dt>Your stay</dt><dd>The whole house</dd></div>
        </dl>
        <nav className={styles.jumpNav} aria-label="On this page"><a href="#living">Living spaces</a><a href="#downstairs">Downstairs</a><a href="#sleeping">Bedrooms</a><a href="#outside">Outside</a><a href="#house-details">House details</a></nav>
      </section>

      <section id="living" className={`${styles.container} ${styles.section}`} aria-labelledby="living-title">
        <div className={styles.sectionHead}><div><p className={styles.eyebrow}>01 / Together</p><h2 id="living-title">Dinner together.<br />Fireplace after.</h2></div><p>The kitchen, dining area, and great room connect on the main level. Tall windows, a cathedral ceiling, and seating around the fireplace.</p></div>
        <div className={styles.livingGrid}>
          <Photograph photo={photos.living} caption="The great room" detail="Cathedral ceiling · fireplace" sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1376px) 54vw, 730px" />
          <Photograph photo={photos.kitchen} caption="Kitchen & dining" detail="Breakfast bar · room to cook" sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1376px) 38vw, 518px" />
        </div>
      </section>

      <section id="downstairs" className={`${styles.container} ${styles.section} ${styles.downstairs}`} aria-labelledby="downstairs-title">
        <div className={styles.downstairsGrid}>
          <div className={styles.downstairsCopy}>
            <p className={styles.eyebrow}>02 / Downstairs</p>
            <h2 id="downstairs-title">Another place<br />to settle in.</h2>
            <p>The lower level adds a second lounge, another fireplace, and lake-facing doors to the covered walkout patio.</p>
            <p className={styles.smallNote}>It gives a full group somewhere else to spread out without losing the connection to the yard and water.</p>
          </div>
          <Photograph photo={photos.downstairs} caption="The downstairs lounge" detail="Second fireplace · walkout patio" sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1376px) 60vw, 760px" />
        </div>
      </section>

      <section id="sleeping" className={styles.sleeping} aria-labelledby="sleeping-title">
        <div className={styles.container}>
          <div className={styles.roomLead}>
            <Photograph photo={photos.woodBedroom} caption="The wood-floor bedroom" detail="White bedding · folded towels" sizes="(max-width: 900px) calc(100vw - 36px), (max-width: 1376px) 58vw, 770px" />
            <div className={styles.roomCopy}><p className={styles.eyebrow}>03 / Turn in</p><h2 id="sleeping-title">Three bedrooms.<br />Your own space.</h2><p>A king bedroom, a queen bedroom, and a twin-over-full bunk room. A queen sleeper sofa gives your group another way to arrange the night.</p><p className={styles.smallNote}>Eight overnight guests maximum. The sofa is additional sleeping space, not a fourth bedroom.</p><a className={styles.textLink} href="#sleeping-plan">See the sleeping plan <span aria-hidden="true">↓</span></a></div>
          </div>
          <div className={styles.roomPair}>
            <Photograph photo={photos.blueBedroom} caption="The blue-throw bedroom" detail="White bedding · tiled floor" />
            <Photograph photo={photos.bunkRoom} caption="The bunk room" detail="Twin over full" />
          </div>
          <div id="sleeping-plan" className={styles.sleepPlan}><h3>The sleeping plan</h3><SleepPlan /></div>
        </div>
      </section>

      <section id="outside" className={`${styles.container} ${styles.section}`} aria-labelledby="outside-title">
        <div className={styles.sectionHead}><div><p className={styles.eyebrow}>04 / Just outside</p><h2 id="outside-title">From the deck<br />to the water.</h2></div><div><p>The upper deck for outdoor dining. A covered patio and hot tub below. Then the lawn, firepit, and private shoreline.</p><Link className={styles.textLink} href="/grounds">Explore the waterfront <span aria-hidden="true">→</span></Link></div></div>
        <div className={styles.outsideGrid}>
          <Photograph photo={photos.grounds} caption="The lawn, dock & waterfront seating" />
          <Photograph photo={photos.autumn} caption="Autumn at the water’s edge" />
        </div>
        <p className={styles.smallNote}>Dock use and outdoor equipment depend on the season and conditions. Children and pets need close supervision by the water.</p>
      </section>

      <section id="house-details" className={`${styles.container} ${styles.details}`} aria-labelledby="details-title">
        <div><p className={styles.eyebrow}>A few practical things</p><h2 id="details-title">Know the house<br />before you arrive.</h2><a className={styles.textLink} href={hostContactHref()}>Ask Nate &amp; Allie <span aria-hidden="true">↗</span></a></div>
        <dl className={styles.detailsList}>
          <div><dt>Two full bathrooms</dt><dd>Both have bathing facilities. Ask us about the layout when bathroom access matters for your group.</dd></div>
          <div><dt>Space on two levels</dt><dd>A great room upstairs, another lounge downstairs, an upper deck, and a walkout patio. There are stairs; contact us about mobility needs before booking.</dd></div>
          <div><dt>Kitchen & laundry</dt><dd>A full kitchen, indoor and outdoor dining areas, and laundry at the house.</dd></div>
          <div><dt>Two fireplaces</dt><dd>One upstairs and one downstairs.</dd></div>
        </dl>
      </section>

      <section className={styles.close} aria-labelledby="dates-title"><div className={`${styles.container} ${styles.closeInner}`}>
        <div><p className={styles.eyebrow}>Hosted by Nate &amp; Allie</p><h2 id="dates-title">Got a few nights<br />in mind?</h2><p>Send your dates. We’ll check availability and send the full quote before payment.</p></div>
        <div className={styles.closeActions}><Link className={styles.button} href="/book">Check your dates <span aria-hidden="true">↗</span></Link><Link className={styles.textLink} href="/photos">See the photo gallery <span aria-hidden="true">→</span></Link><p>Already booked? <Link href="/guidebook">Open the Guest Guide</Link>.</p></div>
      </div></section>
    </main>
  );
}
