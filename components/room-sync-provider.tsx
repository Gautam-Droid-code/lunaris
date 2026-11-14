"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRoomSync } from "@/lib/room-sync";

type RoomSyncState = { needsTap: boolean; unlock: () => void; isLeader: boolean };
const RoomSyncContext = createContext<RoomSyncState>({ needsTap: false, unlock: () => {}, isLeader: false });

export function RoomSyncProvider({ children }: { children: ReactNode }) {
  const state = useRoomSync();
  return <RoomSyncContext.Provider value={state}>{children}</RoomSyncContext.Provider>;
}

export function useRoomSyncState() {
  return useContext(RoomSyncContext);
}
