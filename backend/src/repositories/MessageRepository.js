import Message from "../models/Message.model.js";

class MessageRepository {
  async findConversation(userId1, userId2) {
    return Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 });
  }

  async create(messageData) {
    const message = new Message(messageData);
    return message.save();
  }

  async countUnread(senderId, receiverId) {
    return Message.countDocuments({
      senderId,
      receiverId,
      isRead: false,
      isDeleted: false,
      deletedBy: { $ne: receiverId },
    });
  }

  async markAsRead(senderId, receiverId) {
    return Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async findById(id) {
    return Message.findById(id);
  }

  async softDeleteForEveryone(id) {
    return Message.findByIdAndUpdate(
      id,
      { isDeleted: true, text: "This message was deleted", image: null },
      { new: true }
    );
  }

  async addToDeletedBy(id, userId) {
    return Message.findByIdAndUpdate(
      id,
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );
  }

  async deleteManyBetweenUsers(userId1, userId2) {
    return Message.deleteMany({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    });
  }
}

export default new MessageRepository();
