import { Server } from "socket.io";

export let io;

export function initSocket(httpServer) {
  console.log("initSocket - src/config/socket.js");
  io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("join-trip", (tripId) => {
      socket.join(`trip-${tripId}`);
    });

    socket.on("leave-trip", (tripId) => {
      socket.leave(`trip-${tripId}`);
    });
  });

  return io;
}
