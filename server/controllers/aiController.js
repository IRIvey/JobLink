import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiChat = async (req, res) => {
  try {
    const { promptType, messages } = req.body;

    if (!promptType || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const recent = messages.slice(-20);
    const chatHistory = recent
      .map((m) => `${m.isMe ? "User" : "Recruiter"}: ${m.text}`)
      .join("\n");

    let prompt = "";

    if (promptType === "suggest") {
      prompt = `You are a job-platform chat assistant.
Write a short, professional reply to the recruiter.
Do not invent facts. If needed, ask 1 short clarifying question.

Chat:
${chatHistory}`;
    } else if (promptType === "detect") {
      const last = recent[recent.length - 1]?.text || "";
      prompt = `Check if this recruitment message looks like a scam.
Return: risk (low/medium/high) + 2 reasons, short.

Message: ${last}`;
    } else {
      return res.status(400).json({ success: false, message: "Unknown promptType" });
    }

   // This is the most stable string for the Flash model
// Locate this line in your controller
// CHANGE THIS:
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// TO THIS (The 2026 Stable Standard):
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, text });
  } catch (err) {
    // --- DETAILED ERROR PRINTING ---
    console.error("--- Gemini Error Detail ---");
    console.error("Name:", err.name);         // e.g., GoogleGenerativeAIFetchError
    console.error("Status:", err.status);     // e.g., 404
    console.error("Status Text:", err.statusText);
    
    // This often contains the most important info from Google's backend
    if (err.errorDetails) {
      console.error("Details:", JSON.stringify(err.errorDetails, null, 2));
    }
    
    // Check if it's a model-not-found error specifically
    if (err.status === 404) {
      console.error("SUGGESTION: The API key might not have access to this model in your region, or the model name is incorrect.");
    }

    res.status(err.status || 500).json({ 
      success: false, 
      message: "Gemini request failed",
      errorType: err.name 
    });
  }
};