"use client";

import { useEffect, useRef, useState } from "react";
import { player as playerSingleton, usePlayer } from "@/components/player-provider";
import { useCurrentRoom } from "@/lib/room-store";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { Track } from "@/lib/music";

export type SyncPayload = {
  videoId: string;
  positionSec: number;
  isPlaying: boolean;
  at: number;
  title?: string | null;
  artists?: { name: string | null }[];
  thumbnails?: { url: string; width: number | null; height: number | null }[];
  durationSeconds?: number | null;
};

function toTrack(p: SyncPayload): Track | null {
  if (!p.videoId) return null;
  return {
    id: p.videoId,
    videoId: p.videoId,
    title: p.title ?? null,
    artists: (p.artists ?? []).map((a) => ({ id: null, name: a.name ?? null })),
    album: null,
    duration: null,
    durationSeconds: p.durationSeconds ?? null,
    thumbnails: (p.thumbnails ?? []).map((t) => ({ url: t.url, width: t.width, height: t.height })),
    isExplicit: null,
  };
}

export function useRoomSync() {
  const { room } = useCurrentRoom();
  const player = usePlayer();
  const [needsTap, setNeedsTap] = useState(false);
  const audioUnlocked = useRef(false);
  const lastVideoId = useRef<string | null>(null);
  const lastLeaderVideo = useRef<string | null>(null);
  const lastLeaderPlaying = useRef<boolean | null>(null);

  const isLeader = room?.isLeader === true;
  const roomId = room?.id ?? null;

  // Leader: broadcast on videoId/isPlaying change + 4s ping
  useEffect(() => {
    if (!roomId || !isLeader) return;
    const supabase = createSupabaseBrowser();
    const channel = supabase.channel(`room-sync:${roomId}`);
    channel.subscribe();

    const broadcast = () => {
      const s = playerSingleton.getState();
      if (!s.currentTrack) return;
      const payload: SyncPayload = {
        videoId: s.currentTrack.videoId,
        positionSec: s.currentTime,
        isPlaying: s.isPlaying,
        at: Date.now(),
        title: s.currentTrack.title,
        artists: s.currentTrack.artists,
        thumbnails: s.currentTrack.thumbnails,
        durationSeconds: s.currentTrack.durationSeconds,
      };
      channel.send({ type: "broadcast", event: "sync", payload });
    };

    const unsub = playerSingleton.subscribe(() => {
      const s = playerSingleton.getState();
      const vid = s.currentTrack?.videoId ?? null;
      if (vid !== lastLeaderVideo.current || s.isPlaying !== lastLeaderPlaying.current) {
        lastLeaderVideo.current = vid;
        lastLeaderPlaying.current = s.isPlaying;
        broadcast();
      }
    });

    const ping = setInterval(() => {
      const s = playerSingleton.getState();
      if (s.isPlaying) broadcast();
    }, 4000);

    return () => {
      clearInterval(ping);
      unsub();
      supabase.removeChannel(channel);
    };
  }, [roomId, isLeader, player]);

  // Follower: apply sync
  useEffect(() => {
    if (!roomId || isLeader) return;
    player.setFollowMode(true);
    const supabase = createSupabaseBrowser();
    const channel = supabase.channel(`room-sync:${roomId}`);
    channel.on("broadcast", { event: "sync" }, ({ payload }) => {
      const p = payload as SyncPayload;
      if (!p?.videoId) return;
      const expected = p.positionSec + (p.isPlaying ? (Date.now() - p.at) / 1000 : 0);

      if (p.videoId !== lastVideoId.current) {
        lastVideoId.current = p.videoId;
        const t = toTrack(p);
        if (t) player.remoteLoad(t);
      }
      if (p.isPlaying) {
        if (!audioUnlocked.current) {
          setNeedsTap(true);
          return;
        }
        player.remotePlay();
        const s = playerSingleton.getState();
        if (Math.abs(s.currentTime - expected) > 1.5) {
          player.remoteSeek(expected);
        }
      } else {
        player.remotePause();
        player.remoteSeek(expected);
      }
    });
    channel.subscribe();

    return () => {
      player.setFollowMode(false);
      supabase.removeChannel(channel);
      lastVideoId.current = null;
      audioUnlocked.current = false;
      setNeedsTap(false);
    };
  }, [roomId, isLeader, player]);

  const unlock = () => {
    audioUnlocked.current = true;
    setNeedsTap(false);
    player.remotePlay();
  };

  return { needsTap, unlock, isLeader };
}
