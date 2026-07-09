import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import type {
  NewGameCreatedEvent,
  SlotUpdatedEvent,
} from "@squadup/shared";
import type { Socket } from "socket.io-client";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`;

const socketUrl =
  import.meta.env.VITE_API_URL ?? apiBaseUrl.replace(/\/api\/?$/, "");

export function useSocket() {
  const [socket] = useState<Socket>(() =>
    io(socketUrl, {
      autoConnect: false,
    }),
  );

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const joinGameRoom = useCallback(
    (gameId: string) => socket.emit("join-game-room", gameId),
    [socket],
  );

  const leaveGameRoom = useCallback(
    (gameId: string) => socket.emit("leave-game-room", gameId),
    [socket],
  );

  const joinAreaRoom = useCallback(
    (lat: number, lng: number) => socket.emit("join-area-room", { lat, lng }),
    [socket],
  );

  const leaveAreaRoom = useCallback(
    (lat: number, lng: number) => socket.emit("leave-area-room", { lat, lng }),
    [socket],
  );

  const onSlotUpdated = useCallback(
    (callback: (event: SlotUpdatedEvent) => void) => {
      socket.on("slotUpdated", callback);
      return () => {
        socket.off("slotUpdated", callback);
      };
    },
    [socket],
  );

  const onNewGameCreated = useCallback(
    (callback: (event: NewGameCreatedEvent) => void) => {
      socket.on("newGameCreated", callback);
      return () => {
        socket.off("newGameCreated", callback);
      };
    },
    [socket],
  );

  return {
    socket,
    joinGameRoom,
    leaveGameRoom,
    joinAreaRoom,
    leaveAreaRoom,
    onSlotUpdated,
    onNewGameCreated,
  };
}
