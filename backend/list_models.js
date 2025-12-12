import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        console.log("Fetching models...");
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                     console.log("- " + m.name.replace("models/", ""));
                }
            });
        } else {
            console.log("No models found or unexpected format:", data);
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

listModels();
