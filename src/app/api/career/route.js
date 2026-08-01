import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getWorkingModel, invalidateModelCache } from '@/lib/geminiModelResolution';

const SYSTEM_PROMPT = `You are an expert career counselor and labor market analyst.
Based on the candidate's target role and extracted skills, estimate their salary range in India, find similar adjacent roles they are qualified for, and provide brief industry trend notes.
Do NOT invent specific unverifiable statistics, exact percentages, or make factual guarantees. Phrase trends as general estimates (e.g. "generally growing").

Output MUST be valid JSON strictly following this schema:
{
  "salaryEstimate": {
    "range": "string (e.g. ₹4L - ₹7L per annum)",
    "disclaimer": "string (e.g. 'Ungrounded general estimate based on AI training data for this role in India — actual offers vary significantly by company, location, and experience level.')"
  },
  "similarRoles": [
    {
      "title": "string",
      "reason": "string (one line reason based on their skills)"
    }
  ],
  "industryTrends": [
    "string (short cautiously-phrased statement about demand)"
  ],
  "careerPath": [
    {
      "stage": "string (e.g. Junior Developer)",
      "timeline": "string (e.g. 0-2 years)"
    }
  ]
}`;

export async function POST(request) {
    try {
        const { targetRole, skills } = await request.json();

        if (!targetRole || !skills || skills.length === 0) {
            return NextResponse.json({ error: "Couldn't load your personalized data, please try again." }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        let modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
        
        let modelOptions = { 
            model: modelName,
            systemInstruction: SYSTEM_PROMPT
            // Removed googleSearch grounding as it is not reliably supported across all model versions
        };

        let model = genAI.getGenerativeModel(modelOptions);

        const prompt = `Target Role: ${targetRole || "Unknown"}\nExtracted Skills: ${skills.join(", ")}`;

        let retries = 1;
        while (retries >= 0) {
            try {
                let response = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    }
                });
                return NextResponse.json(JSON.parse(response.response.text()));
            } catch (apiError) {
                const errorMessage = apiError.message || "";
                
                // If grounding isn't supported by this model, try falling back to just the model without grounding
                if (errorMessage.toLowerCase().includes("unsupported") || errorMessage.toLowerCase().includes("tool")) {
                    console.warn("[Gemini Fallback] Grounding failed or unsupported, retrying without tools.");
                    modelOptions = { model: modelName, systemInstruction: SYSTEM_PROMPT };
                    model = genAI.getGenerativeModel(modelOptions);
                    // Don't decrement retries for this specific fallback, just continue to retry immediately
                    continue;
                }

                if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("no longer available") || errorMessage.includes("404")) {
                    console.error(`[Gemini Fallback] Model ${modelName} missing in /api/career.`);
                    invalidateModelCache();
                    modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
                    modelOptions.model = modelName;
                    model = genAI.getGenerativeModel(modelOptions);
                }
                
                if (retries === 0) {
                    console.error("[Gemini Error] /api/career failed. RAW ERROR LOG:");
                    console.error(apiError);
                    console.error("apiError.message:", apiError.message);
                    console.error("apiError.status:", apiError?.status);
                    console.error("apiError.response:", apiError?.response ? JSON.stringify(apiError.response, null, 2) : "undefined");
                    return NextResponse.json({ error: "Career Intelligence service temporarily unavailable." }, { status: 502 });
                }
                retries--;
            }
        }
    } catch (error) {
        console.error("Career API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
