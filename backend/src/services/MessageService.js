import messageRepository from "../repositories/MessageRepository.js";
import userRepository from "../repositories/UserRepository.js";
import imageService from "./ImageService.js";
import { socketRegistry } from "../socket/index.js";
import {
  NotFoundError,
  AuthorizationError,
} from "../errors/index.js";

class MessageService {
  async getUsersForSidebar(currentUserId) {
    const users = await userRepository.findAllExcept(currentUserId);

    const usersWithUnread = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await messageRepository.countUnread(
          user._id,
          currentUserId
        );
        return {
          ...user.toJSON(),
          unreadCount,
        };
      })
    );

    return usersWithUnread;
  }

  async getMessages(currentUserId, otherUserId) {
    const messages = await messageRepository.findConversation(
      currentUserId,
      otherUserId
    );

    return messages.filter(
      (msg) => !msg.deletedBy.includes(currentUserId)
    );
  }

  async sendMessage(senderId, receiverId, { text, image }) {
    const messageData = {
      senderId,
      receiverId,
    };

    if (text?.trim()) messageData.text = text.trim();
    if (image) {
      const imageUrl = await imageService.upload(image, "ripple_messages");
      messageData.image = imageUrl;
    }

    const newMessage = await messageRepository.create(messageData);

    const receiverSocketId = socketRegistry.getSocketId(receiverId);
    if (receiverSocketId) {
      const { getIO } = await import("../socket/index.js");
      getIO().to(receiverSocketId).emit("newMessage", newMessage);
    }

    return newMessage;
  }

  async markAsRead(senderId, receiverId) {
    await messageRepository.markAsRead(senderId, receiverId);

    const senderSocketId = socketRegistry.getSocketId(senderId);
    if (senderSocketId) {
      const { getIO } = await import("../socket/index.js");
      getIO().to(senderSocketId).emit("messagesRead", { readBy: receiverId });
    }
  }

  async deleteMessage(messageId, userId, deleteType) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    if (deleteType === "everyone") {
      if (message.senderId.toString() !== userId.toString()) {
        throw new AuthorizationError(
          "You can only delete your own messages for everyone"
        );
      }

      const deletedMessage =
        await messageRepository.softDeleteForEveryone(messageId);

      const receiverSocketId = socketRegistry.getSocketId(
        message.receiverId.toString()
      );
      if (receiverSocketId) {
        const { getIO } = await import("../socket/index.js");
        getIO().to(receiverSocketId).emit("messageDeleted", {
          messageId,
          deleteType: "everyone",
          message: deletedMessage,
        });
      }

      return deletedMessage;
    }

    return messageRepository.addToDeletedBy(messageId, userId);
  }

  async deleteChatHistory(userId, otherUserId) {
    await messageRepository.deleteManyBetweenUsers(userId, otherUserId);
    return { success: true };
  }
}

export default new MessageService();
