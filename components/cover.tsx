"use client";

import Image from "next/image";
import { useState } from "react";
import { MusicIcon } from "@/components/icons";
import { artUrl } from "@/lib/format";
import type { Thumbnail } from "@/lib/music";

/**
 * Artwork with one shared fallback: missing or broken art becomes an inset
 * neumorphic well with a quiet music note, never a bordered broken image.
 */
export function Cover({
  thumbnails,
  alt,
  size,
  className,
}: {
  thumbnails: Thumbnail[];
  alt: string;
  size: number;
  className?: string;
}) {
  const src = artUrl(thumbnails, size);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div
      className={`overflow-hidden ${
        showImage ? "bg-surface" : "nm-cover-fallback nm-inset-sm"
      } ${className ?? ""}`}
    >
      {src && failedSrc !== src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      ) : (
        <span
          className="grid size-full place-items-center"
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
        >
          <MusicIcon className="nm-cover-icon" />
        </span>
      )}
    </div>
  );
}
