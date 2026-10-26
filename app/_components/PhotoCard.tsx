import Image from "next/image";
import type { CSSProperties } from "react";

export function PhotoCard({
  src,
  alt,
  title,
  note,
  wide = false,
  position = "center",
  zoom = 1,
}: {
  src: string;
  alt: string;
  title: string;
  note: string;
  wide?: boolean;
  position?: string;
  zoom?: number;
}) {
  const imageStyle: CSSProperties = {
    objectPosition: position,
    ...(zoom === 1
      ? {}
      : {
          transform: `scale(${zoom})`,
          transformOrigin: position,
        }),
  };

  return (
    <figure className={`photo-card${wide ? " photo-card-wide" : ""}`}>
      <div className="photo-card-image">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={wide ? "(max-width: 720px) 100vw, 66vw" : "(max-width: 720px) 100vw, 34vw"}
          style={imageStyle}
        />
      </div>
      <figcaption><strong>{title}</strong><span>{note}</span></figcaption>
    </figure>
  );
}
