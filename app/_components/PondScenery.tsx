import Image from "next/image";
import Link from "next/link";
import styles from "./PondScenery.module.css";

type SceneKey = "home" | "waterfront" | "explore";

const images: Record<SceneKey, { candidate: string; fallback: string; position: string }> = {
  home: {
    candidate: "/images/kpl/pond-aerials/kp3-autumn-wide.webp",
    fallback: "/images/kpl/fall-pond.webp",
    position: "center 48%",
  },
  waterfront: {
    candidate: "/images/kpl/pond-aerials/kp2-autumn-shoreline.webp",
    fallback: "/images/kpl/2026-10-28/kendall-pond-lodge-dawn-mist.webp",
    position: "center 48%",
  },
  explore: {
    candidate: "/images/kpl/pond-aerials/kendall-pond-autumn-overlook.webp",
    fallback: "/images/kpl/website-top-50/09-Waterfront-and-Grounds/46-kendall-pond-lodge-autumn-pond-and-dock.jpg",
    position: "center 45%",
  },
};

type Props = {
  scene: SceneKey;
  eyebrow: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  compact?: boolean;
};

/**
 * A scenic interlude, never a representation of the private rental footprint.
 *
 * The supplied aerial images are not yet licensed for commercial use. This
 * component deliberately falls back to existing KPL media until their rights
 * and upload are verified. See docs/POND-AERIAL-PHOTO-RELEASE.md.
 */
export function PondScenery({
  scene,
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  compact = false,
}: Props) {
  const rightsCleared = process.env.KPL_POND_AERIAL_RIGHTS_CLEARED === "true";
  const image = images[scene];

  return (
    <section
      className={`${styles.scene} ${compact ? styles.compact : ""}`}
      aria-label={eyebrow}
      data-pond-scenery={scene}
    >
      <div className={styles.photograph} aria-hidden="true">
        <Image
          src={rightsCleared ? image.candidate : image.fallback}
          alt=""
          fill
          sizes="100vw"
          style={{ objectPosition: image.position }}
        />
      </div>
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2>{title}</h2>
        <p className={styles.description}>{description}</p>
        <Link className={styles.action} href={actionHref}>
          {actionLabel} <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <p className={styles.caption}>
        Kendall Pond · Gardner, Massachusetts{rightsCleared ? " · Aerial view" : ""}
      </p>
    </section>
  );
}
