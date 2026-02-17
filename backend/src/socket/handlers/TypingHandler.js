import socketRegistry from "../SocketRegistry.js";

export function handleTyping(io, socket) {
  socket.on("typing", ({ toUserId }) => {
    const receiverSocketId = socketRegistry.getSocketId(toUserId);
    if (receiverSocketId) {
      const senderId = socketRegistry.findUserIdBySocketId(socket.id);
      io.to(receiverSocketId).emit("userTyping", { userId: senderId });
    }
  });

  socket.on("stopTyping", ({ toUserId }) => {
    const receiverSocketId = socketRegistry.getSocketId(toUserId);
    if (receiverSocketId) {
      const senderId = socketRegistry.findUserIdBySocketId(socket.id);
      io.to(receiverSocketId).emit("userStoppedTyping", { userId: senderId });
    }
  });
}
