import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key not configured" });
    }

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
