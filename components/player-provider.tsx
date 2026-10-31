"use client";

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { recordPlay } from "@/lib/library-store";
import type { Radio, Track } from "@/lib/music";
import { createPlayer, initialState, type PlayerState } from "@/lib/player-engine";
import { createYouTubePlayer } from "@/lib/youtube";

async function fetchRadio(videoId: string): Promise<Track[]> {
  const response = await fetch(`/api/radio/${encodeURIComponent(videoId)}`);
  if (!response.ok) throw new Error("Radio request failed");
  const radio: Radio | null = await response.json();
  return radio?.tracks ?? [];
}

// Lives outside React so playback survives every navigation and remount.
export const player = createPlayer(fetchRadio, recordPlay);

type PlayerActions = Pick<
  typeof player,
  | "playTrack"
  | "togglePlay"
  | "next"
  | "prev"
  | "seek"
  | "setVolume"
  | "toggleShuffle"
  | "toggleRepeat"
>;

const actions: PlayerActions = {
  playTrack: player.playTrack,
  togglePlay: player.togglePlay,
  next: player.next,
  prev: player.prev,
  seek: player.seek,
  setVolume: player.setVolume,
  toggleShuffle: player.toggleShuffle,
  toggleRepeat: player.toggleRepeat,
};

const PlayerContext = createContext<(PlayerState & PlayerActions) | null>(null);

export function usePlayer() {
  const value = use(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside PlayerProvider");
  return value;
}

// The newest mounted slot is where the player currently sits.
const slots: HTMLElement[] = [];
let playerCreated = false;

const noSubscribe = () => () => {};

// The iframe keeps one layout size and is scaled onto each slot, so YouTube never sees a
// resize while playing. Keep this 16:9, like the slots.
const PLAYER_WIDTH = 480;
const PLAYER_HEIGHT = 270;

/** The one fixed container holding the YouTube iframe. It never moves in the DOM. */
function PlayerHost({ visible }: { visible: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!playerCreated) {
      playerCreated = true;
      // YouTube swaps this element for its iframe, so it has to stay out of React's tree.
      const target = host.appendChild(document.createElement("div"));
      createYouTubePlayer(target, {
        onReady: player.connect,
        onState: player.handleState,
        onError: player.handleError,
        onLoadFailure: player.handleLoadFailure,
      });
    }

    let frame = requestAnimationFrame(function follow() {
      const slot = slots.at(-1);
      const box = slot?.getBoundingClientRect();
      if (slot && box?.width && box.height) {
        const scaleX = box.width / PLAYER_WIDTH;
        const scaleY = box.height / PLAYER_HEIGHT;
        host.style.transform = `translate(${box.left}px, ${box.top}px) scale(${scaleX}, ${scaleY})`;
        const radius = parseFloat(getComputedStyle(slot).borderRadius) || 0;
        host.style.borderRadius = `${radius / scaleX}px / ${radius / scaleY}px`;
        // In the mini bar, taps fall through to the link that opens Now Playing.
        host.style.pointerEvents = slot.dataset.interactive ? "auto" : "none";
      }
      frame = requestAnimationFrame(follow);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={hostRef}
      data-player-host
      className="fixed left-0 top-0 z-20 origin-top-left overflow-hidden"
      style={{
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        visibility: visible ? "visible" : "hidden",
      }}
    />
  );
}

/** Marks a spot on the page for the player to sit over. */
export function PlayerSlot({
  className,
  interactive = false,
  children,
}: {
  className: string;
  interactive?: boolean;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = ref.current;
    if (!slot) return;
    slots.push(slot);
    return () => {
      slots.splice(slots.indexOf(slot), 1);
    };
  }, []);

  return (
    <div ref={ref} data-interactive={interactive || undefined} className={className}>
      {children}
    </div>
  );
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(player.subscribe, player.getState, () => initialState);
  const isClient = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const value = useMemo(() => ({ ...state, ...actions }), [state]);

  return (
    <PlayerContext value={value}>
      {children}
      {isClient &&
        createPortal(<PlayerHost visible={state.currentTrack !== null} />, document.body)}
    </PlayerContext>
  );
}
