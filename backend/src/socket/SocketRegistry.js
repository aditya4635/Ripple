import logger from "../utils/logger.js";

class SocketRegistry {
  constructor() {
    this.userSocketMap = {};
  }

  register(userId, socketId) {
    this.userSocketMap[userId] = socketId;
    logger.debug(`User ${userId} connected with socket ${socketId}`);
  }

  unregister(userId) {
    delete this.userSocketMap[userId];
    logger.debug(`User ${userId} disconnected`);
  }

  getSocketId(userId) {
    return this.userSocketMap[userId] || null;
  }

  getOnlineUserIds() {
    return Object.keys(this.userSocketMap);
  }

  findUserIdBySocketId(socketId) {
    return Object.entries(this.userSocketMap).find(
      ([, sId]) => sId === socketId
    )?.[0];
  }
}

export default new SocketRegistry();
