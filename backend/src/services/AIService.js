import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { AppError } from "../errors/index.js";

class AIService {
  constructor() {
    this.model = null;
  }

  _getModel() {
    if (!this.model) {
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      this.model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        tools: [{ googleSearch: {} }],
      });
    }
    return this.model;
  }

  async chat(message) {
    try {
      const model = this._getModel();
      const result = await model.generateContent(message);
      const response = result.response.text();
      return { reply: response };
    } catch (error) {
      logger.error("AI chat failed", error);
      throw new AppError("Failed to get AI response", 500);
    }
  }
}

export default new AIService();
