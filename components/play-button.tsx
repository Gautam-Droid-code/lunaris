"use client";

import { PauseIcon, PlayIcon } from "@/components/icons";
import { usePlayer } from "@/components/player-provider";

export function PlayButton({
  className,
  iconClassName,
}: {
  className: string;
  iconClassName?: string;
}) {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();
  const Icon = isPlaying ? PauseIcon : PlayIcon;

  return (
    <button
      type="button"
      onClick={togglePlay}
      disabled={!currentTrack}
      aria-label={isPlaying ? "Pause" : "Play"}
      className={className}
    >
      <Icon className={iconClassName} />
    </button>
  );
}
