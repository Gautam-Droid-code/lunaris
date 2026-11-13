"use client";

import { useEffect } from "react";
import { refreshCurrentRoom } from "@/lib/room-store";

export function RoomPresence() {
  useEffect(() => {
    void refreshCurrentRoom();
  }, []);
  return null;
}
