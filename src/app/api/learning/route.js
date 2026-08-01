import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getWorkingModel, invalidateModelCache } from '@/lib/geminiModelResolution';

const SYSTEM_PROMPT = `You are a learning and development expert.
Based on the provided list of missing skills, recommend 3 resource types per skill (e.g., Course, Video, Article), suggesting a platform and a specific topic focus. 
Do NOT provide specific URLs as they might hallucinate. Provide just the type, platform name, and topic.
Also, suggest up to 1 realistic, well-known certification specifically for each skill if one is highly relevant. If not, leave it null.

Output MUST be valid JSON strictly following this schema:
{
  "skills": [
    {
      "skillName": "string",
      "certification": {
        "name": "string or null",
        "description": "string or null"
      },
      "resources": [
        {
          "type": "string (e.g. Course, Video, Article)",
          "platform": "string",
          "topic": "string"
        }
      ]
    }
  ]
}`;

export async function POST(request) {
    try {
        const { missingSkills } = await request.json();

        if (!missingSkills || missingSkills.length === 0) {
            return NextResponse.json({ skills: [], certifications: [] });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        let modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
        let model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_PROMPT
        });

        const prompt = `Missing Skills: ${missingSkills.join(", ")}`;

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
                if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("no longer available") || errorMessage.includes("404")) {
                    console.error(`[Gemini Fallback] Model ${modelName} missing in /api/learning.`);
                    invalidateModelCache();
                    modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
                    model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });
                }
                
                if (retries === 0) {
                    console.error("[Gemini Error] /api/learning failed:", apiError);
                    return NextResponse.json({ error: "Learning & Growth service temporarily unavailable." }, { status: 502 });
                }
                retries--;
            }
        }
    } catch (error) {
        console.error("Learning API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
