import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeApplicants = async (req, res) => {
  try {
    const { promptType, applicants, totalCount } = req.body;

    // Validate payload
    if (!promptType || promptType !== "analyze_applicants") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid promptType. Expected 'analyze_applicants'" 
      });
    }

    if (!Array.isArray(applicants) || applicants.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No applicants data provided" 
      });
    }

    // Build concise analysis prompt
    const prompt = `You are a recruitment analyst.
Analyze the following ${totalCount || applicants.length} applicants and provide:
1. 📊 Summary (3–4 key insights)
2. ⭐ Top 3 Candidates (Name + why recommended)
3. 💼 Top 5 Most Common Skills
4. 🚀 3 Clear Hiring Recommendations

Rules:
- Max 350 words
- Be concise
- No repetition
- Focus on actionable insights

**Applicant Data:**
${JSON.stringify(applicants, null, 2)}`;

    // Use the stable Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Return successful response
    res.json({ 
      success: true, 
      text,
      analyzedCount: applicants.length 
    });

  } catch (err) {
    // Detailed error logging
    console.error("--- Gemini Applicant Analysis Error ---");
    console.error("Name:", err.name);
    console.error("Status:", err.status);
    console.error("Status Text:", err.statusText);
    
    if (err.errorDetails) {
      console.error("Details:", JSON.stringify(err.errorDetails, null, 2));
    }
    
    // Specific error handling
    if (err.status === 404) {
      console.error("SUGGESTION: The API key might not have access to this model in your region, or the model name is incorrect.");
      return res.status(404).json({ 
        success: false, 
        message: "Gemini model not found. Check API key permissions.",
        errorType: err.name 
      });
    }

    if (err.status === 429) {
      console.error("SUGGESTION: Rate limit exceeded. Too many requests.");
      return res.status(429).json({ 
        success: false, 
        message: "Too many requests. Please try again in a moment.",
        errorType: err.name 
      });
    }

    if (err.status === 400) {
      console.error("SUGGESTION: Invalid request format or content policy violation.");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request. Check applicant data format.",
        errorType: err.name 
      });
    }

    // Generic error response
    res.status(err.status || 500).json({ 
      success: false, 
      message: "Failed to analyze applicants with AI",
      errorType: err.name 
    });
  }
};