import socketRegistry from "../SocketRegistry.js";

export function handleConnection(io, socket) {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    socketRegistry.register(userId, socket.id);
    io.emit("getOnlineUsers", socketRegistry.getOnlineUserIds());
  }

  socket.on("disconnect", () => {
    if (userId && userId !== "undefined") {
      socketRegistry.unregister(userId);
      io.emit("getOnlineUsers", socketRegistry.getOnlineUserIds());
    }
  });
}
