import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { getAreaRoomKey } from "./geoRoom.js";

export let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-game-room", (gameId: string) => {
      socket.join(`game-${gameId}`);
    });

    socket.on("leave-game-room", (gameId: string) => {
      socket.leave(`game-${gameId}`);
    });

    socket.on("join-area-room", ({ lat, lng }: { lat: number; lng: number }) => {
      socket.join(getAreaRoomKey(lat, lng));
    });

    socket.on("leave-area-room", ({ lat, lng }: { lat: number; lng: number }) => {
      socket.leave(getAreaRoomKey(lat, lng));
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
