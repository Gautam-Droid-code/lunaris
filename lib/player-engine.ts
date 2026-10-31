import type { Track } from "@/lib/music";

export type Repeat = "off" | "all" | "one";

export type PlayerState = {
  currentTrack: Track | null;
  queue: Track[];
  index: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: Repeat;
  notice: string | null;
};

/** The parts of a video player the engine needs. YouTube implements this in the browser. */
export type PlayerBackend = {
  load(videoId: string): void;
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  time(): number;
  duration(): number;
};

// Values of YT.PlayerState.
const PLAYING = 1;
const PAUSED = 2;
const ENDED = 0;
const BUFFERING = 3;

const POLL_MS = 500;
const RESTART_AFTER_SECONDS = 3;
const MAX_SKIPS_IN_A_ROW = 5;
const NOTICE_MS = 5000;

const REPEAT_ORDER: Repeat[] = ["off", "all", "one"];

export const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  index: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 100,
  shuffle: false,
  repeat: "off",
  notice: null,
};

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createPlayer(
  fetchRadio: (videoId: string) => Promise<Track[]>,
  onTrackStart?: (track: Track) => void,
) {
  let state = initialState;
  let backend: PlayerBackend | null = null;
  let pendingVideoId: string | null = null;
  const listeners = new Set<() => void>();

  // Each new queue gets a version, so a slow radio response can't join a later queue.
  let queueVersion = 0;
  let unshuffledQueue: Track[] | null = null;
  let extension: { version: number; promise: Promise<void> } | null = null;
  let lastExtensionKey = "";

  let skips = 0;
  let startAnnounced = false;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let noticeTimer: ReturnType<typeof setTimeout> | null = null;

  function update(patch: Partial<PlayerState>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }

  function showNotice(notice: string) {
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => update({ notice: null }), NOTICE_MS);
    update({ notice });
  }

  function poll() {
    if (!backend) return;
    const currentTime = backend.time();
    const duration = backend.duration() || state.duration;
    if (currentTime !== state.currentTime || duration !== state.duration) {
      update({ currentTime, duration });
    }
  }

  function startPolling() {
    if (pollTimer === null) pollTimer = setInterval(poll, POLL_MS);
  }

  function stopPolling() {
    if (pollTimer !== null) clearInterval(pollTimer);
    pollTimer = null;
  }

  function extend(force = false): Promise<void> {
    if (extension?.version === queueVersion) return extension.promise;

    const key = `${queueVersion}:${state.queue.length}`;
    const seed = state.queue.at(-1);
    if (!seed || (!force && key === lastExtensionKey)) return Promise.resolve();
    lastExtensionKey = key;

    const version = queueVersion;
    const promise = fetchRadio(seed.videoId)
      .then((tracks) => {
        if (version !== queueVersion) return;
        const seen = new Set(state.queue.map((track) => track.videoId));
        const fresh = tracks.filter((track) => {
          if (seen.has(track.videoId)) return false;
          seen.add(track.videoId);
          return true;
        });
        if (fresh.length === 0) return;
        unshuffledQueue?.push(...fresh);
        update({ queue: [...state.queue, ...fresh] });
      })
      .catch(() => {
        // The current track keeps playing; the queue just stops when it runs out.
      })
      .finally(() => {
        if (extension?.promise === promise) extension = null;
      });
    extension = { version, promise };
    return promise;
  }

  function extendIfNearEnd() {
    if (state.repeat !== "all" && state.index >= state.queue.length - 2) void extend();
  }

  function start(index: number) {
    const track = state.queue[index];
    startAnnounced = false;
    update({
      currentTrack: track,
      index,
      currentTime: 0,
      duration: track.durationSeconds ?? 0,
    });
    if (backend) backend.load(track.videoId);
    else pendingVideoId = track.videoId;
    extendIfNearEnd();
  }

  async function advance() {
    const { index, queue, repeat } = state;
    if (index + 1 < queue.length) return start(index + 1);
    if (repeat === "all") return start(0);

    const version = queueVersion;
    await extend(true);
    if (version !== queueVersion || state.index !== index) return;
    if (index + 1 < state.queue.length) start(index + 1);
    else showNotice("That's the end of the queue");
  }

  function handleEnded() {
    if (state.repeat === "one") {
      startAnnounced = false;
      backend?.seek(0);
      backend?.play();
    } else {
      void advance();
    }
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getState: () => state,

    connect(player: PlayerBackend) {
      backend = player;
      player.setVolume(state.volume);
      if (pendingVideoId) player.load(pendingVideoId);
      pendingVideoId = null;
    },

    handleState(code: number) {
      if (code === BUFFERING) return;
      const isPlaying = code === PLAYING;
      if (state.isPlaying !== isPlaying) update({ isPlaying });

      if (isPlaying) {
        skips = 0;
        startPolling();
        if (!startAnnounced && state.currentTrack) {
          startAnnounced = true;
          onTrackStart?.(state.currentTrack);
        }
        return;
      }
      stopPolling();
      if (code === PAUSED) poll();
      if (code === ENDED) handleEnded();
    },

    /** Called when a video can't play, usually because its owner blocks embedding. */
    handleError() {
      skips += 1;
      if (skips >= MAX_SKIPS_IN_A_ROW) {
        skips = 0;
        stopPolling();
        update({ isPlaying: false });
        showNotice("These songs can't play here");
        return;
      }
      showNotice(`Skipped “${state.currentTrack?.title ?? "that song"}”, it can't play here`);
      void advance();
    },

    handleLoadFailure() {
      showNotice("Couldn't load the YouTube player");
    },

    playTrack(track: Track, queue?: Track[]) {
      const isCurrent = state.currentTrack?.videoId === track.videoId;
      if (isCurrent && !queue) {
        if (!state.isPlaying) backend?.play();
        return;
      }

      let list = queue ?? [track];
      let index = list.indexOf(track);
      if (index < 0) index = list.findIndex((item) => item.videoId === track.videoId);
      if (index < 0) {
        list = [track, ...list];
        index = 0;
      }

      queueVersion += 1;
      unshuffledQueue = null;
      skips = 0;
      if (state.shuffle) {
        unshuffledQueue = [...list];
        list = [track, ...shuffled(list.filter((_, i) => i !== index))];
        index = 0;
      }

      if (isCurrent) {
        update({ queue: list, index, currentTrack: list[index] });
        extendIfNearEnd();
        if (!state.isPlaying) backend?.play();
        return;
      }
      update({ queue: list });
      start(index);
    },

    togglePlay() {
      if (!state.currentTrack) return;
      if (state.isPlaying) backend?.pause();
      else backend?.play();
    },

    next() {
      if (state.currentTrack) void advance();
    },

    prev() {
      if (!state.currentTrack) return;
      if (state.currentTime > RESTART_AFTER_SECONDS || state.index <= 0) {
        backend?.seek(0);
        update({ currentTime: 0 });
      } else {
        start(state.index - 1);
      }
    },

    seek(seconds: number) {
      const currentTime = Math.max(0, seconds);
      backend?.seek(currentTime);
      update({ currentTime });
    },

    setVolume(volume: number) {
      const clamped = Math.min(100, Math.max(0, volume));
      backend?.setVolume(clamped);
      update({ volume: clamped });
    },

    toggleShuffle() {
      const shuffle = !state.shuffle;
      const { queue, index } = state;
      if (shuffle) {
        unshuffledQueue = [...queue];
        const played = queue.slice(0, index + 1);
        update({ shuffle, queue: [...played, ...shuffled(queue.slice(index + 1))] });
      } else if (unshuffledQueue) {
        const restored = unshuffledQueue;
        unshuffledQueue = null;
        update({
          shuffle,
          queue: restored,
          index: state.currentTrack ? restored.indexOf(state.currentTrack) : index,
        });
      } else {
        update({ shuffle });
      }
    },

    toggleRepeat() {
      const next = (REPEAT_ORDER.indexOf(state.repeat) + 1) % REPEAT_ORDER.length;
      update({ repeat: REPEAT_ORDER[next] });
      if (state.currentTrack) extendIfNearEnd();
    },
  };
}
