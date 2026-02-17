import { Server } from "socket.io";
import config from "../config/index.js";
import socketRegistryInstance from "./SocketRegistry.js";
import { handleConnection } from "./handlers/ConnectionHandler.js";
import { handleTyping } from "./handlers/TypingHandler.js";
import { handleWebRTC } from "./handlers/WebRTCHandler.js";
import logger from "../utils/logger.js";

let io = null;

export const socketRegistry = socketRegistryInstance;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.cors.origins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    handleConnection(io, socket);
    handleTyping(io, socket);
    handleWebRTC(io, socket);
  });

  logger.info("Socket.io initialized");
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
}
