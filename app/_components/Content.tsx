import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icons";

export function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </header>
  );
}

export function InfoCard({
  id,
  icon,
  title,
  children,
  href,
  linkLabel,
}: {
  id?: string;
  icon?: string;
  title: string;
  children: ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <article className="info-card" id={id}>
      {icon && <span className="icon-chip"><Icon name={icon} /></span>}
      <h3>{title}</h3>
      <div className="card-copy">{children}</div>
      {href && <Link className="text-link" href={href}>{linkLabel ?? "Open"}</Link>}
    </article>
  );
}

export function Notice({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "safety" | "warm" }) {
  return <aside className={`notice notice-${tone}`}>{children}</aside>;
}
