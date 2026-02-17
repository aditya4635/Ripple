import messageService from "../services/MessageService.js";
import { HTTP_STATUS } from "../utils/constants.js";

class MessageController {
  async getUsersForSidebar(req, res, next) {
    try {
      const users = await messageService.getUsersForSidebar(req.user._id);
      res.status(HTTP_STATUS.OK).json(users);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await messageService.getMessages(
        req.user._id,
        req.params.id
      );
      res.status(HTTP_STATUS.OK).json(messages);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const message = await messageService.sendMessage(
        req.user._id,
        req.params.id,
        req.body
      );
      res.status(HTTP_STATUS.CREATED).json(message);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      await messageService.markAsRead(req.params.id, req.user._id);
      res.status(HTTP_STATUS.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const result = await messageService.deleteMessage(
        req.params.id,
        req.user._id,
        req.body.deleteType
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteChatHistory(req, res, next) {
    try {
      const result = await messageService.deleteChatHistory(
        req.user._id,
        req.params.userId
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
