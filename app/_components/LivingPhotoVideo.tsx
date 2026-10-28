"use client";

import { useEffect, useRef } from "react";

export function LivingPhotoVideo({
  src,
  poster,
  className,
  objectPosition,
}: {
  src: string;
  poster?: string;
  className: string;
  objectPosition?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.6;
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      style={{ objectPosition }}
    />
  );
}
