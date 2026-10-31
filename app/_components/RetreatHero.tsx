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

/**
 * One immersive, real-property photograph at a time.
 * Native radio controls let guests choose a different view without autoplay,
 * JavaScript timers, or interference with the direct-booking flow.
 */
export function RetreatHero({ directEnabled, airbnbHref, scenes }: Props) {
  const photographs = [
    { ...scenes[0], caption: "Kendall Pond in fall" },
    { ...scenes[1], caption: "The hot tub" },
    { ...scenes[2], caption: "The upper deck" },
  ] as const;
  const action = <><span>Check your dates</span><span aria-hidden="true">↗</span></>;

  return (
    <section className={styles.hero} aria-labelledby="showcase-title" data-retreat-hero data-pond-header>
      <div className={styles.photographs} data-pond-photos>
        {photographs.map((scene, index) => (
          <div
            className={styles.photograph + (index === 0 ? " " + styles.leadPhoto : "")}
            key={scene.src}
            data-pond-photo={index}
          >
            <Image
              src={scene.src}
              alt={scene.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              style={{ objectPosition: scene.position }}
            />
          </div>
        ))}
      </div>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy} data-pond-copy>
          <p className={styles.location}>The Lodge at Kendall Pond <span>Gardner, Massachusetts</span></p>
          <div className={styles.story}>
            <p className={styles.eyebrow}>A whole house on the water</p>
            <h1 id="showcase-title"><span>Down by</span> <span>the pond.</span></h1>
            <p className={styles.intro}>The dock is across the lawn, the hot tub is under the deck, and inside there's room for everyone to settle in.</p>
            <p className={styles.welcome}>Three bedrooms, two full bathrooms, room for eight. We're Nate and Allie, and we live close by.</p>
            <div className={styles.actions}>
              {directEnabled ? (
                <Link className={styles.primary} href="/book">{action}</Link>
              ) : (
                <a className={styles.primary} href={airbnbHref} target="_blank" rel="noopener noreferrer">{action}<span className={styles.srOnly}> on Airbnb</span></a>
              )}
              <Link className={styles.secondary} href="/photos">Explore the Lodge <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.details} aria-label="Stay at a glance">
            <span>Entire waterfront home</span><span>8 guests</span><span>Private dock</span>
          </div>
          <fieldset className={styles.photoChoices}>
            <legend className={styles.srOnly}>Choose the photograph shown above</legend>
            {photographs.map((scene, index) => (
              <label className={styles.sceneOption} key={scene.src}>
                <input
                  className={styles.sceneInput}
                  type="radio"
                  name="kpl-hero-photo"
                  value={String(index)}
                  defaultChecked={index === 0}
                />
                <span className={styles.sceneThumb}>
                  <Image src={scene.src} alt="" fill sizes="(max-width: 760px) 86px, 110px" />
                </span>
                <span className={styles.sceneLabel}><small>{"0" + (index + 1)}</small>{scene.caption}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>
    </section>
  );
}
