import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) process.exit(1);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-flash-latest",
  tools: [
    {
      googleSearch: {},
    },
  ],
});

async function run() {
  try {
    console.log("Testing grounding...");
    const result = await model.generateContent("What is the stock price of Google right now?");
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.error("Message:", error.message);
  }
}

run();
