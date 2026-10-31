import type { ArtistRef, Thumbnail } from "@/lib/music";

export function artistNames(artists: ArtistRef[]): string {
  const names = artists.map((artist) => artist.name).filter(Boolean);
  return names.length > 0 ? names.join(", ") : "Unknown artist";
}

/** Picks the largest thumbnail and asks Google's image CDN for the needed size. */
export function artUrl(thumbnails: Thumbnail[], size: number): string | null {
  const largest = thumbnails.reduce<Thumbnail | null>(
    (best, thumb) => (!best || (thumb.width ?? 0) > (best.width ?? 0) ? thumb : best),
    null,
  );
  if (!largest?.url) return null;

  return largest.url
    .replace(/=w\d+-h\d+/, `=w${size}-h${size}`)
    .replace(/=s\d+(?=$|-)/, `=s${size}`);
}

/** Formats seconds as m:ss, or h:mm:ss for long tracks. */
export function clockTime(seconds: number): string {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const secs = String(total % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}`
    : `${Math.floor(total / 60)}:${secs}`;
}
