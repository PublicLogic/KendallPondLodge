"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

/** Visitor-controlled views: the first frame stays still until a guest chooses. */
export function RetreatHero({ directEnabled, airbnbHref, scenes }: Props) {
  const [selected, setSelected] = useState(0);
  const scene = scenes[selected];
  const action = <><span>Find your dates</span><span aria-hidden="true">↗</span></>;

  return (
    <section className={styles.hero} aria-labelledby="showcase-title" data-retreat-hero>
      <div className={styles.photograph} id="retreat-view">
        <Image
          src={scene.src}
          alt={scene.alt}
          fill
          priority={selected === 0}
          sizes="100vw"
          style={{ objectPosition: scene.position }}
        />
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.location}>Kendall Pond <span aria-hidden="true">/</span> Gardner, Massachusetts</p>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>A weekend at your own pace</p>
          <h1 id="showcase-title">Make time<br /><em>for each other.</em></h1>
          <p className={styles.intro}>Coffee by the water. A long soak in the hot tub. The whole place to yourselves, with no need to rush.</p>
          <div className={styles.actions}>
            {directEnabled ? (
              <Link className={styles.primary} href="/book">{action}</Link>
            ) : (
              <a className={styles.primary} href={airbnbHref} target="_blank" rel="noopener noreferrer">{action}<span className={styles.srOnly}> on Airbnb</span></a>
            )}
            <Link className={styles.secondary} href="/photos">Take a look around <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.invitation}>A little of what’s waiting.</p>
          <div className={styles.scenes} role="group" aria-label="Choose a view of the Lodge">
            {scenes.map((item, index) => (
              <button
                className={styles.scene}
                type="button"
                key={item.src}
                aria-pressed={selected === index}
                aria-controls="retreat-view"
                onClick={() => setSelected(index)}
              >
                <span className={styles.sceneNumber} aria-hidden="true">0{index + 1}</span>
                {item.label}
              </button>
            ))}
          </div>
          <span className={styles.srOnly} role="status" aria-live="polite">{scene.label}: {scene.alt}</span>
        </div>
      </div>
    </section>
  );
}
