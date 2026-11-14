"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Cover } from "@/components/cover";
import {
  MoreIcon,
  NextIcon,
  PlayIcon,
  PrevIcon,
  QueueIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
} from "@/components/icons";
import { LikeButton } from "@/components/like-button";
import { PlayButton } from "@/components/play-button";
import { PlayerSlot, player, usePlayer } from "@/components/player-provider";
import { artistNames, clockTime } from "@/lib/format";
import { openTrackMenu } from "@/lib/library-store";
import type { Lyrics, Song, TimedLyricLine, Track } from "@/lib/music";

type DisplayLyric = { time: number | null; text: string };

const TIMESTAMP = /^\s*\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s?/;

/** Accepts both plain lyrics and LRC/timed-line payloads. */
function toDisplayLyrics(lyrics: Lyrics | null): { lines: DisplayLyric[]; synced: boolean } {
  // Prefer parsed LRC lines from LRCLIB when available.
  if (lyrics?.lines && lyrics.lines.length > 0) {
    const lines = lyrics.lines
      .map((line) => ({ time: line.timeMs / 1000, text: line.text.trim() }))
      .filter((line) => line.text.length > 0);
    return { lines, synced: true };
  }

  const raw = lyrics?.lyrics;
  if (!raw) return { lines: [], synced: false };

  if (Array.isArray(raw)) {
    const lines = raw
      .map((line) => {
        const timed = line as TimedLyricLine;
        return {
          time: typeof timed.start_time === "number" ? timed.start_time / 1000 : null,
          text: timed.text?.trim() ?? "",
        };
      })
      .filter((line) => line.text.length > 0);

    return {
      lines,
      synced: lines.some((line) => line.time !== null),
    };
  }

  const parsed = raw
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(TIMESTAMP);
      if (!match) return { time: null, text: line.trim() };

      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0;
      return {
        time: minutes * 60 + seconds + fraction,
        text: line.slice(match[0].length).trim(),
      };
    })
    .filter((line) => line.text.length > 0);

  const timed = parsed.filter((line) => line.time !== null);
  if (timed.length >= 2) {
    return {
      lines: timed.sort((a, b) => (a.time ?? 0) - (b.time ?? 0)),
      synced: true,
    };
  }

  return {
    lines: parsed.map((line) => ({ time: null, text: line.text })),
    synced: false,
  };
}

function ExpandIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
    </svg>
  );
}

function CollapseIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5" />
    </svg>
  );
}

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
        className="nm-seek"
        style={{ "--fill": `${percent}%` } as CSSProperties}
      />
      <div className={`mt-1 flex justify-between text-[11px] tabular-nums nm-muted`}>
        <span>{clockTime(shownTime)}</span>
        <span>{duration > 0 ? clockTime(duration) : "--:--"}</span>
      </div>
    </div>
  );
}

function PlayerCard({
  track,
  notice,
  expanded,
  onToggleExpanded,
}: {
  track: Track;
  notice: string | null;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const {
    currentTrack,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
    volume,
    setVolume,
    prev,
    next,
  } = usePlayer();
  const repeatLabel = { off: "Repeat off", all: "Repeat all", one: "Repeat one" }[repeat];

  return (
    <section className={`nm-card nm-raised p-4 sm:p-5`} aria-label="Player">
      <div className="flex items-center gap-4">
        <div className="w-28 shrink-0">
          <div className="nm-video-well nm-inset nm-glow-pulse">
            <div className="nm-video-frame">
              <Cover
                thumbnails={track.thumbnails}
                alt=""
                size={192}
                className="absolute inset-0 size-full"
              />
              {!expanded && (
                <>
                  <PlayerSlot
                    interactive={false}
                    className="absolute inset-0 overflow-hidden rounded-[13px]"
                  />
                  <button
                    type="button"
                    onClick={onToggleExpanded}
                    aria-label="Expand video"
                    className="absolute inset-0 z-30 grid place-items-end p-1.5"
                  >
                    <span className={`nm-expand-disc nm-raised grid size-7 place-items-center`}>
                      <ExpandIcon className="size-3.5" />
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1
            className={`track-title truncate text-lg font-semibold leading-tight nm-strong`}
          >
            {track.title ?? "Untitled"}
          </h1>
          <p role="status" className={`mt-1 truncate text-sm nm-muted`}>
            {notice ?? artistNames(track.artists)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <SeekBar />
      </div>

      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={prev}
          disabled={!currentTrack}
          aria-label="Previous track"
          className={`nm-icon-button nm-raised grid size-11 place-items-center`}
        >
          <PrevIcon className="size-4" />
        </button>
        <PlayButton
          className={`nm-play-disc nm-raised grid size-20 place-items-center`}
          iconClassName="size-7"
        />
        <button
          type="button"
          onClick={next}
          disabled={!currentTrack}
          aria-label="Next track"
          className={`nm-icon-button nm-raised grid size-11 place-items-center`}
        >
          <NextIcon className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleShuffle}
          aria-label="Shuffle"
          aria-pressed={shuffle}
          className={`nm-icon-button nm-raised grid size-11 place-items-center ${
            shuffle ? "nm-icon-button-active" : ""
          }`}
        >
          <ShuffleIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={toggleRepeat}
          aria-label={repeatLabel}
          title={repeatLabel}
          aria-pressed={repeat !== "off"}
          className={`nm-icon-button nm-raised grid size-11 place-items-center ${
            repeat === "off" ? "" : "nm-icon-button-active"
          }`}
        >
          <RepeatIcon className="size-4" />
          {repeat === "one" && (
            <span className="absolute text-[0.55rem] font-bold leading-none">1</span>
          )}
        </button>
        <LikeButton tracks={[track]} label={`Like ${track.title ?? "this song"}`} />
        <Link
          href="/queue"
          aria-label="Queue"
          className={`nm-icon-button nm-raised grid size-11 place-items-center`}
        >
          <QueueIcon className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => openTrackMenu(track)}
          aria-label="More options for this song"
          className={`nm-icon-button nm-raised grid size-11 place-items-center`}
        >
          <MoreIcon className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <VolumeIcon className={`size-4 shrink-0 nm-muted`} />
        <input
          type="range"
          aria-label="Volume"
          min={0}
          max={100}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className={`nm-seek min-w-0 flex-1`}
          style={{ "--fill": `${volume}%` } as CSSProperties}
        />
      </div>
    </section>
  );
}

function LyricsPanel({ videoId }: { videoId: string }) {
  const { currentTime } = usePlayer();
  const [lyrics, setLyrics] = useState<Lyrics | null | "failed" | "loading">("loading");
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

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

  const parsed = useMemo(
    () => (typeof lyrics === "object" ? toDisplayLyrics(lyrics) : { lines: [], synced: false }),
    [lyrics],
  );

  const activeIndex = useMemo(() => {
    if (!parsed.synced) return -1;

    let active = -1;
    for (let index = 0; index < parsed.lines.length; index += 1) {
      const time = parsed.lines[index].time;
      if (time === null) continue;
      if (time <= currentTime + 0.15) active = index;
      else break;
    }
    return active;
  }, [parsed, currentTime]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const container = scrollRef.current;
    const line = activeLineRef.current;
    if (!container || !line) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = line.offsetTop - container.clientHeight / 2 + line.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
  }, [activeIndex]);

  const loading = lyrics === "loading";
  const failed = lyrics === "failed";
  const empty =
    typeof lyrics === "object" &&
    lyrics !== null &&
    (!lyrics.lines || lyrics.lines.length === 0) &&
    (!lyrics.lyrics || (Array.isArray(lyrics.lyrics) && lyrics.lyrics.length === 0));

  return (
    <section className="min-w-0" aria-label="Lyrics">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="nm-eyebrow">Lyrics</h2>
        {parsed.synced && <span className="nm-badge nm-raised">Synced</span>}
      </div>

      <div
        ref={scrollRef}
        className={`nm-lyric-scroll mt-3 h-[62vh] min-h-[340px] overflow-y-auto pr-2 lg:h-[calc(100dvh_-_12rem)] lg:max-h-[720px]`}
      >
        {loading && (
          <div
            className={`nm-well nm-inset flex min-h-[240px] animate-pulse flex-col items-center justify-center gap-2 p-8 text-center`}
          >
            <p className={`text-sm font-medium nm-strong`}>Loading lyrics…</p>
            <p className={`max-w-xs text-xs nm-muted`}>
              Finding the words for this track.
            </p>
          </div>
        )}

        {failed && (
          <div
            className={`nm-well nm-inset flex min-h-[240px] flex-col items-center justify-center gap-2 p-8 text-center`}
          >
            <p className={`text-sm font-medium nm-strong`}>
              Lyrics aren&apos;t available right now
            </p>
            <p className={`max-w-xs text-xs nm-muted`}>
              The song keeps playing while we try again later.
            </p>
          </div>
        )}

        {empty && (
          <div
            className={`nm-well nm-inset flex min-h-[240px] flex-col items-center justify-center gap-2 p-8 text-center`}
          >
            <p className={`text-sm font-medium nm-strong`}>No lyrics for this song</p>
            <p className={`max-w-xs text-xs nm-muted`}>
              Timed lyrics will appear here and follow along when they&apos;re available.
            </p>
          </div>
        )}

        {!loading && !failed && !empty && parsed.synced && (
          <>
            <ol className="flex flex-col gap-1 py-[22vh]">
              {parsed.lines.map((line, index) => {
                const active = index === activeIndex;
                return (
                  <li key={`${line.time ?? "line"}-${index}`}>
                    <p
                      ref={active ? activeLineRef : undefined}
                      className={`nm-lyric-line ${active ? "nm-lyric-line-active nm-pressed" : ""} text-xl leading-snug tracking-tight sm:text-2xl`}
                    >
                      {line.text}
                    </p>
                  </li>
                );
              })}
            </ol>
            {typeof lyrics === "object" && lyrics?.source && (
              <p className={`pb-10 text-center text-xs nm-muted`}>{lyrics.source}</p>
            )}
          </>
        )}

        {!loading && !failed && !empty && !parsed.synced && (
          <div className="mx-auto max-w-xl px-2 py-8 sm:px-4">
            {lyrics !== null && typeof lyrics === "object" && typeof lyrics.lyrics === "string" ? (
              <p
                className={`nm-plain-line whitespace-pre-line text-lg leading-relaxed tracking-tight sm:text-xl`}
              >
                {lyrics.lyrics}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {parsed.lines.map((line, index) => (
                  <p
                    key={`${line.text}-${index}`}
                    className={`nm-plain-line text-lg leading-relaxed tracking-tight sm:text-xl`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            )}
            {typeof lyrics === "object" && lyrics?.source && (
              <p className={`mt-8 text-xs nm-muted`}>{lyrics.source}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function UpNext({
  tracks,
  queue,
  currentId,
}: {
  tracks: Track[];
  queue: Track[];
  currentId: string | undefined;
}) {
  const { playTrack } = usePlayer();
  const visible = tracks.slice(0, 8);

  return (
    <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start" aria-label="Up next">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 className="nm-eyebrow">Up next</h2>
        {tracks.length > 0 && (
          <span className={`text-xs tabular-nums nm-muted`}>{tracks.length}</span>
        )}
      </div>

      {visible.length === 0 ? (
        <div className={`nm-well nm-inset mt-3 p-6 text-center`}>
          <p className={`text-sm font-medium nm-strong`}>Nothing queued yet</p>
          <p className={`mt-1 text-xs nm-muted`}>
            Recommendations fill in here as the radio loads.
          </p>
        </div>
      ) : (
        <ol className="mt-3 flex flex-col gap-3">
          {visible.map((track) => {
            const isCurrent = track.videoId === currentId;
            return (
              <li key={track.videoId}>
                <button
                  type="button"
                  onClick={() => playTrack(track, queue)}
                  aria-current={isCurrent || undefined}
                  className="nm-row nm-raised"
                >
                  <Cover
                    thumbnails={track.thumbnails}
                    alt=""
                    size={96}
                    className={`nm-thumb nm-raised size-12 shrink-0`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold nm-strong`}>
                      {track.title ?? "Untitled"}
                    </span>
                    <span className={`mt-0.5 block truncate text-xs nm-muted`}>
                      {artistNames(track.artists)}
                    </span>
                  </span>
                  <span className={`nm-row-play nm-inset grid size-8 shrink-0 place-items-center`}>
                    <PlayIcon className="size-3.5" />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}

/** Shows whatever is playing, starting `song` if the page was opened on a different track. */
export function NowPlayingDetails({ song }: { song: Song }) {
  const { currentTrack, notice, queue, index, playTrack } = usePlayer();
  const track = currentTrack ?? song;
  const currentId = currentTrack?.videoId;
  const [expanded, setExpanded] = useState(false);

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

  // The expanded video is a modal, so lock the page and let Escape close it.
  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const upcoming = useMemo(() => {
    const seen = new Set<string>();
    const result: Track[] = [];

    for (let position = Math.max(index + 1, 0); position < queue.length; position += 1) {
      const item = queue[position];
      if (item.videoId === currentId || seen.has(item.videoId)) continue;
      seen.add(item.videoId);
      result.push(item);
    }

    return result;
  }, [queue, index, currentId]);

  return (
    <>
      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.65fr)_minmax(240px,0.95fr)] lg:items-start xl:gap-8">
        <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <PlayerCard
            track={track}
            notice={notice}
            expanded={expanded}
            onToggleExpanded={() => setExpanded((value) => !value)}
          />
        </div>

        <LyricsPanel key={track.videoId} videoId={track.videoId} />

        <UpNext tracks={upcoming} queue={queue} currentId={currentId} />
      </div>

      {expanded && (
        <div role="dialog" aria-modal="true" aria-label="Video player">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Close video"
            tabIndex={-1}
            className="nm-overlay-backdrop"
          />
          <div className="nm-overlay-stage">
            <div className="nm-overlay-frame">
              <Cover
                thumbnails={track.thumbnails}
                alt=""
                size={1280}
                className="absolute inset-0 size-full"
              />
              <PlayerSlot
                interactive
                className="absolute inset-0 overflow-hidden rounded-[18px]"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Collapse video"
            autoFocus
            className={`nm-close-button nm-raised grid size-11 place-items-center`}
          >
            <CollapseIcon className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
