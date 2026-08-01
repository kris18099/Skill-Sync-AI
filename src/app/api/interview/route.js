import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getWorkingModel, invalidateModelCache } from '@/lib/geminiModelResolution';

export async function POST(request) {
    try {
        const { action, targetRole, skills, experienceLevel, answers, questions } = await request.json();

        if (action === "generate" && (!targetRole || !skills || skills.length === 0)) {
            return NextResponse.json({ error: "Couldn't load your personalized data, please try again." }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        let modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
        
        let systemPrompt = "";
        let prompt = "";

        if (action === "generate") {
            systemPrompt = `You are an expert technical interviewer. 
Given a target role, experience level, and a candidate's specific skills, generate exactly 5 interview questions.
CRITICAL RULE: Generate interview questions strictly based on the skills, tools, and projects explicitly mentioned in this resume. Match question difficulty to the candidate's experience level — keep it fundamental and project-specific for freshers/students, and only go deeper into architecture/optimization topics for candidates with clear professional experience in that area.

Output MUST be a JSON array of strings strictly matching this format:
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;
            prompt = `Target Role: ${targetRole}\nExperience Level: ${experienceLevel || "Unknown"}\nSkills: ${skills.join(", ")}`;
        } else if (action === "evaluate") {
            systemPrompt = `You are an expert technical interviewer evaluating a candidate's answers.
You will be given an array of Questions and their corresponding Answers.
Provide short, structured feedback for each answer.

Output MUST be valid JSON strictly matching this schema:
[
  {
    "clarity": "string (e.g. Clear, Unclear, Very Clear)",
    "relevance": "string (e.g. High, Medium, Low)",
    "feedback": "string (short constructive feedback on how to improve)"
  }
]
Must return exactly the same number of feedback objects as there are questions.`;
            
            let combined = "";
            for (let i = 0; i < questions.length; i++) {
                combined += `Q: ${questions[i]}\nA: ${answers[i] || "No answer provided"}\n\n`;
            }
            prompt = combined;
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        let model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemPrompt
        });

        let retries = 1;
        while (retries >= 0) {
            try {
                let response = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2, // slightly higher for interview variety
                        responseMimeType: "application/json"
                    }
                });
                return NextResponse.json(JSON.parse(response.response.text()));
            } catch (apiError) {
                const errorMessage = apiError.message || "";
                if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("no longer available") || errorMessage.includes("404")) {
                    console.error(`[Gemini Fallback] Model ${modelName} missing in /api/interview.`);
                    invalidateModelCache();
                    modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
                    model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
                }
                
                if (retries === 0) {
                    console.error("[Gemini Error] /api/interview failed:", apiError);
                    return NextResponse.json({ error: "Interview service temporarily unavailable." }, { status: 502 });
                }
                retries--;
            }
        }
    } catch (error) {
        console.error("Interview API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
