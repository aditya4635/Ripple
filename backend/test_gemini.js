// ... imports and setup same as before
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API Key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy 
    // actually, to list models we need the model manager usually, but simpler:
    // The library doesn't always expose listModels directly on the main class easily in all versions?
    // Let's use a simpler approach if possible, or just try 'gemini-pro'.
    
    // Actually, let's just try 'gemini-pro' as a fallback test.
    console.log("Trying gemini-pro...");
    const proModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await proModel.generateContent("Test");
    console.log("gemini-pro worked!");
    
    console.log("Trying gemini-1.5-flash again...");
    const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await flashModel.generateContent("Test");
    console.log("gemini-1.5-flash worked!");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
