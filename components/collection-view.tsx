import { Cover } from "@/components/cover";
import { LikeButton } from "@/components/like-button";
import { Notice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
import type { Thumbnail, Track } from "@/lib/music";

export function CollectionView({
  kind,
  title,
  subtitle,
  thumbnails,
  tracks,
}: {
  kind: "album" | "playlist";
  title: string;
  subtitle: string;
  thumbnails: Thumbnail[];
  tracks: Track[];
}) {
  return (
    <>
      <section className="flex items-center gap-5 rounded-[2rem] bg-surface p-4 shadow-raised">
        <Cover
          thumbnails={thumbnails}
          alt={`${title} cover`}
          size={320}
          className="size-28 shrink-0 rounded-3xl sm:size-40"
        />
        <div className="min-w-0">
          <h1 className="track-title line-clamp-2 text-xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 truncate text-sm text-text-muted">{subtitle}</p>
          {tracks.length > 0 && (
            <div className="mt-3">
              <LikeButton tracks={tracks} label={`Like all songs in this ${kind}`} />
            </div>
          )}
        </div>
      </section>

      {tracks.length > 0 ? (
        <TrackList tracks={tracks} />
      ) : (
        <Notice title="No tracks here yet" />
      )}
    </>
  );
}
