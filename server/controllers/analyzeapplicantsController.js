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

    // Build comprehensive analysis prompt
    const prompt = `You are a professional recruitment analyst with expertise in talent assessment and hiring strategy.

**Task:** Analyze the following ${totalCount || applicants.length} job applicants and provide a comprehensive, data-driven hiring summary.

**Applicant Data:**
${JSON.stringify(applicants, null, 2)}

**Instructions:**
Provide a detailed analysis with the following structure:

📊 **OVERVIEW SUMMARY**
- Total applicants breakdown by status (New, Reviewing, Interview Scheduled, Rejected, Hired)
- Overall quality assessment of the applicant pool
- Key trends observed

⭐ **TOP CANDIDATES** (Identify 3-5 best matches)
For each top candidate:
- Name and position applied for
- Overall rating and experience level
- Key strengths and standout qualities
- Why they're recommended for interview/hiring
- Potential concerns (if any)

💼 **SKILL ANALYSIS**
- Most frequently appearing skills (list top 10)
- In-demand skills present in applicants
- Skill gaps or rare expertise identified
- Skill diversity assessment across the pool

📈 **EXPERIENCE INSIGHTS**
- Average experience level across applicants
- Distribution: Entry-level, Mid-level, Senior
- Notable career highlights or achievements
- Industry experience patterns

🌍 **GEOGRAPHIC & AVAILABILITY**
- Location distribution of candidates
- Remote vs. on-site availability
- Geographic diversity assessment

🚩 **RED FLAGS & CONCERNS**
- Any concerning patterns (e.g., mass applications, inconsistencies)
- Applications missing critical information
- Candidates who may need additional screening
- Status distribution issues (too many rejected/pending)

✅ **ACTIONABLE RECOMMENDATIONS**
1. **Immediate Actions:**
   - Which 3-5 candidates to contact first
   - Suggested interview timeline
   
2. **Strategic Insights:**
   - Hiring priority order
   - Positions that are attracting best talent
   - Positions that may need revised requirements
   
3. **Next Steps:**
   - Follow-up actions for recruiting team
   - Communication templates needed
   - Timeline for decision-making

**Formatting Guidelines:**
- Use clear headers with emojis
- Bullet points for easy scanning
- Be specific with names and data
- Keep language professional but conversational
- Provide actionable, practical advice
- Highlight numbers and metrics

Generate a comprehensive report that helps the recruiter make confident, data-driven hiring decisions.`;

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
