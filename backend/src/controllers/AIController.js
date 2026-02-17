import aiService from "../services/AIService.js";
import { HTTP_STATUS } from "../utils/constants.js";

class AIController {
  async chat(req, res, next) {
    try {
      const { message } = req.body;
      const result = await aiService.chat(message);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();
