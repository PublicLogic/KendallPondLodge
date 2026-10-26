import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icons";

type HeroAction = { href: string; label: string };

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  imagePosition = "center",
  primaryAction,
  secondaryAction,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-intro">{intro}</p>
        {(primaryAction || secondaryAction) && (
          <div className="hero-actions">
            {primaryAction && <Link className="button button-primary" href={primaryAction.href}>{primaryAction.label}<Icon name="arrow" size={18} /></Link>}
            {secondaryAction && <Link className="button button-secondary" href={secondaryAction.href}>{secondaryAction.label}</Link>}
          </div>
        )}
      </div>
      <figure className="page-hero-photo">
        <Image src={image} alt={imageAlt} fill priority sizes="(max-width: 860px) 100vw, 48vw" style={{ objectPosition: imagePosition }} />
      </figure>
    </section>
  );
}
