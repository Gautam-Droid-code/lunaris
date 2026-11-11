"use client";

import { usePlayer } from "@/components/player-provider";
import { Cover } from "@/components/cover";
import { CloseIcon, GripIcon, PlayIcon, ShuffleIcon } from "@/components/icons";
import { artistNames } from "@/lib/format";

export function QueueView() {
  const {
    currentTrack,
    queue,
    index,
    shuffle,
    toggleShuffle,
    jumpTo,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = usePlayer();

  const upcoming = queue.slice(index + 1);
  const upcomingStart = index + 1;

  function handleDragStart(event: React.DragEvent, from: number) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(from));
  }

  function handleDrop(event: React.DragEvent, to: number) {
    event.preventDefault();
    const from = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from)) return;
    reorderQueue(from, to);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Now playing */}
      {currentTrack ? (
        <section className="nm-card nm-raised flex items-center gap-4 p-4">
          <span className="nm-inset grid size-14 shrink-0 place-items-center rounded-2xl">
            <Cover
              thumbnails={currentTrack.thumbnails}
              alt=""
              size={96}
              className="size-full rounded-[10px]"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="nm-eyebrow">Now playing</p>
            <p className="mt-1 truncate text-sm font-semibold nm-accent">
              {currentTrack.title ?? "Untitled"}
            </p>
            <p className="truncate text-xs nm-muted">
              {artistNames(currentTrack.artists)}
            </p>
          </div>
          <span className="nm-inset grid size-9 shrink-0 place-items-center rounded-full">
            <PlayIcon className="size-4 nm-accent" />
          </span>
        </section>
      ) : (
        <section className="nm-well nm-inset flex min-h-[96px] items-center justify-center p-4 text-center">
          <p className="text-sm nm-muted">Nothing playing right now.</p>
        </section>
      )}

      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight nm-strong">
          Next up
          {upcoming.length > 0 && (
            <span className="ml-2 text-sm font-normal nm-muted">
              {upcoming.length}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-pressed={shuffle}
            aria-label="Shuffle"
            className={`nm-nav-button nm-raised-sm grid size-10 place-items-center ${
              shuffle ? "nm-pressed-sm nm-accent" : ""
            }`}
          >
            <ShuffleIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={clearQueue}
            disabled={upcoming.length === 0}
            className="nm-card nm-raised-sm rounded-2xl px-4 py-2 text-sm font-medium nm-strong disabled:opacity-50"
          >
            Clear queue
          </button>
        </div>
      </div>

      {/* List */}
      {upcoming.length === 0 ? (
        <div className="nm-well nm-inset flex min-h-[160px] flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="font-medium nm-strong">Your queue is empty</p>
          <p className="text-xs nm-muted">
            Play a song and related tracks will fill in here.
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {upcoming.map((track, i) => {
            const queueIndex = upcomingStart + i;
            return (
              <li
                key={`${track.videoId}-${queueIndex}`}
                draggable
                onDragStart={(e) => handleDragStart(e, queueIndex)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, queueIndex)}
                className="nm-row nm-song-row flex items-center gap-2"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center nm-muted"
                  aria-hidden="true"
                >
                  <GripIcon className="size-4" />
                </span>
                <button
                  type="button"
                  onClick={() => jumpTo(queueIndex)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="nm-thumb nm-inset-sm block shrink-0 p-[2px]">
                    <Cover
                      thumbnails={track.thumbnails}
                      alt=""
                      size={96}
                      className="size-10 rounded-[8px]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold nm-strong">
                      {track.title ?? "Untitled"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs nm-muted">
                      {artistNames(track.artists)}
                    </span>
                  </span>
                  {track.duration && (
                    <span className="shrink-0 text-xs tabular-nums nm-muted">
                      {track.duration}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reorderQueue(queueIndex, Math.max(upcomingStart, queueIndex - 1))}
                    aria-label="Move up"
                    className="nm-nav-button nm-raised-sm grid size-8 place-items-center text-xs"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderQueue(queueIndex, Math.min(queue.length - 1, queueIndex + 1))}
                    aria-label="Move down"
                    className="nm-nav-button nm-raised-sm grid size-8 place-items-center text-xs"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(queueIndex)}
                    aria-label={`Remove ${track.title ?? "track"}`}
                    className="nm-nav-button nm-raised-sm grid size-8 place-items-center"
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
