import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { config } from "../config/env";

export function setupSocket(httpServer: HTTPServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-assessment", (assessmentId: string) => {
      socket.join(assessmentId);
      console.log(`Client ${socket.id} joined room ${assessmentId}`);
    });

    socket.on("leave-assessment", (assessmentId: string) => {
      socket.leave(assessmentId);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}