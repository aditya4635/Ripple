import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) process.exit(1);

const genAI = new GoogleGenerativeAI(apiKey);

// Models to try in order of preference/likelihood of working on free tier
const candidates = [
  "gemini-2.0-flash-exp",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-2.0-flash-001"
];

async function testModels() {
  console.log("Testing models for availability...");
  
  for (const modelName of candidates) {
    console.log(`\nTesting: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`SUCCESS: ${modelName} worked!`);
      console.log("Response:", response.text());
      return; // Stop after first success
    } catch (error) {
       console.log(`FAILED: ${modelName}`);
       console.log(`Error: ${error.message.split('\n')[0]}`); // Print just first line of error
       if (error.status) console.log(`Status: ${error.status}`);
    }
  }
  console.log("\nAll candidates failed.");
}

testModels();
