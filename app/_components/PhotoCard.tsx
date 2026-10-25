import Image from "next/image";

export function PhotoCard({
  src,
  alt,
  title,
  note,
  wide = false,
  position = "center",
}: {
  src: string;
  alt: string;
  title: string;
  note: string;
  wide?: boolean;
  position?: string;
}) {
  return (
    <figure className={`photo-card${wide ? " photo-card-wide" : ""}`}>
      <div className="photo-card-image">
        <Image src={src} alt={alt} fill sizes={wide ? "(max-width: 720px) 100vw, 66vw" : "(max-width: 720px) 100vw, 34vw"} style={{ objectPosition: position }} />
      </div>
      <figcaption><strong>{title}</strong><span>{note}</span></figcaption>
    </figure>
  );
}
