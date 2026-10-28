import Image from "next/image";
import Link from "next/link";
import styles from "./RetreatHero.module.css";

type Scene = {
  label: string;
  src: string;
  alt: string;
  position: string;
};

type Props = {
  directEnabled: boolean;
  airbnbHref: string;
  scenes: readonly [Scene, Scene, Scene];
};

/** Real property photographs in a still, server-rendered pond-house opening. */
export function RetreatHero({ directEnabled, airbnbHref, scenes }: Props) {
  const photographs = [
    { ...scenes[0], caption: "Golden morning on the pond", href: "/grounds" },
    { ...scenes[1], caption: "A long soak", href: "/grounds" },
    { ...scenes[2], caption: "The upper deck", href: "/photos" },
  ];
  const action = <><span>Check your dates</span><span aria-hidden="true">↗</span></>;

  return (
    <section className={styles.hero} aria-labelledby="showcase-title" data-retreat-hero data-pond-header>
      <div className={styles.copy} data-pond-copy>
        <p className={styles.location}>The Lodge at Kendall Pond<span>Gardner, Massachusetts</span></p>
        <div className={styles.story}>
          <h1 id="showcase-title"><span>Down by</span>{" "}<span>the pond.</span></h1>
          <p className={styles.intro}>Coffee on the deck. A long afternoon at the dock. A fire by the water when the day winds down.</p>
          <p className={styles.welcome}>A waterfront home in Gardner, with three bedrooms, a hot tub, and room for up to eight.</p>
          <div className={styles.actions}>
            {directEnabled ? (
              <Link className={styles.primary} href="/book">{action}</Link>
            ) : (
              <a className={styles.primary} href={airbnbHref} target="_blank" rel="noopener noreferrer">{action}<span className={styles.srOnly}> on Airbnb</span></a>
            )}
            <Link className={styles.secondary} href="/photos">Look around <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className={styles.details} aria-label="Stay at a glance">
          <span>The whole house</span><span>Up to eight guests</span><span>Private waterfront</span>
        </div>
      </div>
      <div className={styles.photographs} data-pond-photos>
        {photographs.map((scene, index) => (
          <Link
            className={`${styles.photograph} ${index === 0 ? styles.leadPhoto : styles.detailPhoto}`}
            href={scene.href}
            key={scene.src}
            aria-label={`${scene.caption}: ${scene.href === "/photos" ? "see the Lodge photos" : "explore the waterfront"}`}
            data-pond-photo={index}
          >
            <Image
              src={scene.src}
              alt={scene.alt}
              fill
              priority={index === 0}
              sizes={index === 0 ? "(max-width: 800px) 100vw, 61vw" : "(max-width: 800px) 50vw, 31vw"}
              style={{ objectPosition: scene.position }}
            />
            <span className={styles.caption}><span>{scene.caption}</span><span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
