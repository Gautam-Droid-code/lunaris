"use client";

import { useRouter } from "next/navigation";
import { HeartIcon } from "@/components/icons";
import { loginHref, setLiked, useLibrary } from "@/lib/library-store";
import type { Track } from "@/lib/music";

export function LikeButton({ tracks, label }: { tracks: Track[]; label: string }) {
  const router = useRouter();
  const { ready, user, likedIds } = useLibrary();
  const liked = tracks.length > 0 && tracks.every((track) => likedIds.has(track.videoId));

  function toggle() {
    if (user) void setLiked(tracks, !liked);
    else router.push(loginHref());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-label={label}
      aria-pressed={liked}
      className={`grid size-11 place-items-center rounded-full bg-surface shadow-raised-sm active:shadow-pressed ${
        liked ? "text-accent" : "text-text"
      }`}
    >
      <HeartIcon filled={liked} />
    </button>
  );
}
