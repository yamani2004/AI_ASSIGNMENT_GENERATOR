"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
function setupSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.config.frontendUrl,
            methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
    });
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on("join-assessment", (assessmentId) => {
            socket.join(assessmentId);
            console.log(`Client ${socket.id} joined room ${assessmentId}`);
        });
        socket.on("leave-assessment", (assessmentId) => {
            socket.leave(assessmentId);
        });
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
    return io;
}
//# sourceMappingURL=socketHandler.js.map