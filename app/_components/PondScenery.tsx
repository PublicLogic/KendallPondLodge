import Image from "next/image";
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

/**
 * A low-opacity background texture inside existing content surfaces, not
 * a new hero, scenic interlude, large photo tile or substitute for actual
 * Lodge photography.
 *
 * The supplied aerials are not owned by KPL and must remain unpublished
 * until their commercial-use rights are verified and licensed originals
 * have been added to the mapped paths.
 */
export function PondScenery({ scene }: { scene: SceneKey }) {
  const image = images[scene];
  const licensed = process.env.KPL_POND_AERIAL_RIGHTS_CLEARED === "true";
  return (
    <div className={styles.ambient} aria-hidden="true" data-pond-scenery={scene}>
      <Image
        alt=""
        src={licensed ? image.candidate : image.fallback}
        fill
        sizes="(max-width: 760px) 100vw, 50vw"
        style={{ objectPosition: image.position }}
        loading="lazy"
      />
    </div>
  );
}
