import socketRegistry from "../SocketRegistry.js";
import logger from "../../utils/logger.js";

export function handleWebRTC(io, socket) {
  socket.on("callUser", ({ to, offer, callerName }) => {
    const targetSocketId = socketRegistry.getSocketId(to);
    if (targetSocketId) {
      const callerId = socketRegistry.findUserIdBySocketId(socket.id);
      io.to(targetSocketId).emit("incomingCall", {
        from: callerId,
        offer,
        callerName,
      });
    } else {
      socket.emit("callFailed", { reason: "User is offline" });
    }
  });

  socket.on("answerCall", ({ to, answer }) => {
    const targetSocketId = socketRegistry.getSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callAnswered", { answer });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = socketRegistry.getSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    }
  });

  socket.on("endCall", ({ to }) => {
    const targetSocketId = socketRegistry.getSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  socket.on("rejectCall", ({ to }) => {
    const targetSocketId = socketRegistry.getSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callRejected");
    }
  });
}
