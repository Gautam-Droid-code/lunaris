import Image from "next/image";
import { artUrl } from "@/lib/format";
import type { Thumbnail } from "@/lib/music";

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

  return (
    <div className={`overflow-hidden ${src ? "bg-surface" : "album-art"} ${className ?? ""}`}>
      {src && (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
