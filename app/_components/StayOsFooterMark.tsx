import Image from "next/image";
import styles from "./StayOsFooterMark.module.css";

type StayOsFooterMarkProps = {
  inverse?: boolean;
};

/** Booking platform credit, not the primary Lodge identity. */
export function StayOsFooterMark({ inverse = false }: StayOsFooterMarkProps) {
  return (
    <div
      className={`${styles.mark}${inverse ? ` ${styles.inverse}` : ""}`}
      data-stayos-footer-mark
      aria-label="Booking with PuddleJumper STAY, by PublicLogic"
    >
      <Image
        className={styles.logo}
        src="/brand/stay/puddlejumper-stay.png"
        alt="PuddleJumper STAY"
        width={401}
        height={422}
        sizes="84px"
      />
      <div className={styles.copy}>
        <span className={styles.label}>STAY booking</span>
        <span className={styles.credit}>By PublicLogic</span>
      </div>
    </div>
  );
}
