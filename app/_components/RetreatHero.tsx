import Image from "next/image";
import Link from "next/link";
import styles from "./RetreatHero.module.css";

type Scene = { label: string; src: string; alt: string; position: string };
type Props = {
  directEnabled: boolean;
  airbnbHref: string;
  scenes: readonly [Scene, Scene, Scene, Scene];
};

export function RetreatHero({ directEnabled, airbnbHref, scenes }: Props) {
  const action = "Check your dates";
  return (
    <section className={styles.hero} aria-labelledby="showcase-title" data-retreat-hero data-pond-header>
      <div className={styles.copy} data-pond-copy>
        <p className={styles.location}>Gardner, Massachusetts</p>
        <h1 id="showcase-title"><span>Down by</span> <span>the pond.</span></h1>
        <p className={styles.intro}>Three bedrooms, two baths and room for eight. Walk across the lawn to your private dock, or settle into the hot tub under the deck.</p>
        <p className={styles.welcome}>Your hosts, Nate &amp; Allie</p>
        <div className={styles.actions}>
          {directEnabled ? <Link className={styles.primary} href="/book">{action}</Link> :
            <a className={styles.primary} href={airbnbHref} target="_blank" rel="noopener noreferrer">{action}<span className={styles.srOnly}> on Airbnb</span></a>}
          <Link className={styles.secondary} href="/photos">View all photos <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <div className={styles.gallery}>
        <div className={styles.photographs} data-pond-photos>
          {scenes.map((scene, index) => (
            <div className={styles.photograph} data-pond-photo={index} key={scene.src}>
              <Image src={scene.src} alt={scene.alt} fill priority={index === 0}
                sizes="(max-width: 800px) 100vw, 59vw" style={{ objectPosition: scene.position }} />
            </div>
          ))}
        </div>
        <fieldset className={styles.choices}>
          <legend className={styles.srOnly}>Choose a lodge photograph</legend>
          {scenes.map((scene, index) => (
            <label key={scene.src} className={styles.choice}>
              <input className={styles.sceneInput} type="radio" name="kpl-hero-photo"
                value={index} defaultChecked={index === 0} />
              <span>{scene.label}</span>
            </label>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
