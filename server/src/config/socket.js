import { Server } from "socket.io";

export let io;

// יוצר ומגדיר את שרת ה-Socket.IO מעל httpServer הקיים
export function initSocket(httpServer) {
  console.log("initSocket - src/config/socket.js");
  io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  // כאשר לקוח מתחבר ל-WebSocket
  io.on("connection", (socket) => {
    // הלקוח שולח את ה-tripId שבו הוא נמצא
    socket.on("join-trip", (tripId) => {
      socket.join(`trip-${tripId}`);
    });

    // כאשר הלקוח עוזב את העמוד
    socket.on("leave-trip", (tripId) => {
      socket.leave(`trip-${tripId}`);
    });
  });

  return io;
}
