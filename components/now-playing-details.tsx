"use client";

import { useEffect, useRef, useState } from "react";
import { MoreIcon, RepeatIcon, VolumeIcon } from "@/components/icons";
import { LikeButton } from "@/components/like-button";
import { Notice } from "@/components/notice";
import { PlayWheel } from "@/components/play-wheel";
import { player, usePlayer } from "@/components/player-provider";
import { artistNames, clockTime } from "@/lib/format";
import { openTrackMenu } from "@/lib/library-store";
import type { Lyrics, Song } from "@/lib/music";

function SeekBar() {
  const { currentTime, duration, seek } = usePlayer();
  // While dragging, the thumb follows the finger instead of the playback position.
  const [dragTime, setDragTime] = useState<number | null>(null);
  const shownTime = dragTime ?? currentTime;
  const percent = duration > 0 ? Math.min(100, (shownTime / duration) * 100) : 0;

  function commit() {
    if (dragTime === null) return;
    seek(dragTime);
    setDragTime(null);
  }

  return (
    <div>
      <input
        type="range"
        aria-label="Seek"
        aria-valuetext={`${clockTime(shownTime)} of ${clockTime(duration)}`}
        min={0}
        max={duration || 0}
        step={1}
        value={Math.min(shownTime, duration)}
        disabled={duration === 0}
        onChange={(event) => setDragTime(Number(event.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        className="range"
        style={{ "--fill": `${percent}%` } as React.CSSProperties}
      />
      <div className="mt-2 flex justify-between text-xs tabular-nums text-text-muted">
        <span>{clockTime(shownTime)}</span>
        <span>{duration > 0 ? clockTime(duration) : "--:--"}</span>
      </div>
    </div>
  );
}

function ExtraControls() {
  const { repeat, toggleRepeat, volume, setVolume } = usePlayer();
  const label = { off: "Repeat off", all: "Repeat all", one: "Repeat one" }[repeat];

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggleRepeat}
        aria-label={label}
        title={label}
        className={`relative grid size-11 shrink-0 place-items-center rounded-full bg-surface shadow-raised-sm active:shadow-pressed ${
          repeat === "off" ? "text-text-muted" : "text-accent"
        }`}
      >
        <RepeatIcon />
        {repeat === "one" && (
          <span className="absolute text-[0.6rem] font-semibold leading-none">1</span>
        )}
      </button>
      <VolumeIcon className="size-5 shrink-0 text-text-muted" />
      <input
        type="range"
        aria-label="Volume"
        min={0}
        max={100}
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        className="range"
        style={{ "--fill": `${volume}%` } as React.CSSProperties}
      />
    </div>
  );
}

function LyricsPanel({ videoId }: { videoId: string }) {
  const [lyrics, setLyrics] = useState<Lyrics | null | "failed" | "loading">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/lyrics/${encodeURIComponent(videoId)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : "failed"))
      .then(setLyrics)
      .catch(() => {
        if (!controller.signal.aborted) setLyrics("failed");
      });
    return () => controller.abort();
  }, [videoId]);

  if (lyrics === "loading") return <Notice title="Loading lyrics…" />;
  if (lyrics === "failed") return <Notice title="Lyrics aren't available right now" />;
  if (!lyrics?.lyrics) return <Notice title="No lyrics for this song" />;

  return (
    <section className="rounded-3xl p-6 shadow-pressed">
      <h2 className="text-lg font-semibold tracking-tight">Lyrics</h2>
      <p className="mt-3 whitespace-pre-line leading-relaxed">{lyrics.lyrics}</p>
      {lyrics.source && <p className="mt-4 text-xs text-text-muted">{lyrics.source}</p>}
    </section>
  );
}

/** Shows whatever is playing, starting `song` if the page was opened on a different track. */
export function NowPlayingDetails({ song }: { song: Song }) {
  const { currentTrack, notice, playTrack } = usePlayer();
  const track = currentTrack ?? song;
  const currentId = currentTrack?.videoId;

  // Next.js keeps this page alive and re-runs effects on browser Back, which must resume
  // the current track rather than restart the song this page first opened with.
  const startedSong = useRef<string | null>(null);

  useEffect(() => {
    if (startedSong.current === song.videoId) return;
    startedSong.current = song.videoId;
    if (player.getState().currentTrack?.videoId !== song.videoId) playTrack(song);
  }, [song, playTrack]);

  // Keeps the URL on the playing track. This reads the store, not `currentId`, because
  // the effect above may have just changed the track. replaceState avoids refetching the
  // page, which would otherwise re-run the effect above for a track that's already gone.
  useEffect(() => {
    const id = player.getState().currentTrack?.videoId;
    if (id) window.history.replaceState(null, "", `/now-playing/${id}`);
  }, [currentId]);

  return (
    <>
      <div className="text-center">
        <h1 className="track-title text-2xl font-semibold tracking-tight">
          {track.title ?? "Untitled"}
        </h1>
        <p role="status" className="mt-1 text-text-muted">
          {notice ?? artistNames(track.artists)}
        </p>
      </div>
      <SeekBar />
      <div className="mx-auto">
        <PlayWheel />
      </div>
      <ExtraControls />
      <div className="flex justify-center gap-3">
        <LikeButton tracks={[track]} label={`Like ${track.title ?? "this song"}`} />
        <button
          type="button"
          onClick={() => openTrackMenu(track)}
          aria-label="More options for this song"
          className="grid size-11 place-items-center rounded-full bg-surface shadow-raised-sm active:shadow-pressed"
        >
          <MoreIcon />
        </button>
      </div>
      <LyricsPanel key={track.videoId} videoId={track.videoId} />
    </>
  );
}
