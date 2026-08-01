import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getWorkingModel, invalidateModelCache } from '@/lib/geminiModelResolution';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Simple file-based cache for auto-fix to save API calls
const CACHE_FILE = path.join(process.cwd(), '.autofix_cache.json');
function getCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Cache read error", e);
    }
    return {};
}
function setCache(hash, data) {
    try {
        const cache = getCache();
        cache[hash] = data;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
    } catch (e) {
        console.error("Cache write error", e);
    }
}

const SYSTEM_PROMPT = `You are an expert Resume Writer and ATS Optimizer. 
Your task is to take the raw text of a resume and extract it into a highly structured, ATS-friendly JSON format.

CRITICAL INSTRUCTIONS:
1. For the Work Experience and Projects sections, you MUST rewrite the bullet points to be ATS-friendly. Use strong action verbs, remove passive voice, and ensure clear phrasing. 
2. DO NOT fabricate any metrics, numbers, skills, or experience that are not present in the original text. Only rephrase existing information to sound more professional.
3. If information (like phone or linkedin) is missing, leave it as an empty string.
4. Extract all skills into a flat array of strings.
5. Create a strong, 2-4 sentence Professional Summary based on the resume's contents if one isn't clearly present, or improve the existing one.

Return the data strictly in this JSON schema:
{
  "contact": { "name": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string", "portfolio": "string" },
  "summary": "string",
  "experience": [
    { "company": "string", "title": "string", "startDate": "string", "endDate": "string", "location": "string", "bullets": ["string"] }
  ],
  "education": [
    { "institution": "string", "degree": "string", "startYear": "string", "endYear": "string", "location": "string", "gpa": "string" }
  ],
  "skills": ["string"],
  "projects": [
    { "name": "string", "description": "string", "tech": "string", "link": "string" }
  ]
}`;

export async function POST(request) {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
            return NextResponse.json({ error: "Gemini API Key is missing" }, { status: 500 });
        }

        const body = await request.json();
        const rawText = body.rawText;

        if (!rawText) {
            return NextResponse.json({ error: "rawText is required" }, { status: 400 });
        }

        // --- CACHING LOGIC ---
        const textHash = crypto.createHash('sha256').update(rawText.trim()).digest('hex');
        const cache = getCache();
        if (cache[textHash]) {
            console.log(`[Auto-Fix Cache Hit] Returning cached auto-fix for hash: ${textHash}`);
            return NextResponse.json(cache[textHash]);
        }
        console.log(`[Auto-Fix Cache Miss] Running auto-fix for hash: ${textHash}`);
        // ---------------------

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        let modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
        let model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_PROMPT
        });

        let contentParts = [
            { text: "Please extract and rewrite this resume text into the required JSON format." },
            { text: `Resume Content:\n${rawText}` }
        ];

        let builderData;
        let retries = 1;
        
        while (retries >= 0) {
            try {
                let response = await model.generateContent({
                    contents: [{ role: "user", parts: contentParts }],
                    generationConfig: {
                        temperature: 0.1, // Slight creativity for rewriting, but mostly deterministic
                        responseMimeType: "application/json"
                    }
                });
                
                const jsonString = response.response.text();
                builderData = JSON.parse(jsonString);

                // Basic validation
                if (!builderData.contact || !builderData.experience) {
                    throw new Error("Malformed JSON returned by Gemini");
                }
                
                break;
            } catch (apiError) {
                const errorMessage = apiError.message || "";
                
                if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("no longer available") || errorMessage.includes("404")) {
                    console.error(`[Gemini Fallback] Google changed something: Model ${modelName} no longer available.`);
                    invalidateModelCache();
                    modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
                    model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });
                }

                if (retries === 0) {
                    console.error("[Gemini Error] Auto-Fix Error after retry:", apiError);
                    return NextResponse.json({ error: "Our AI service is temporarily unavailable." }, { status: 502 });
                }
                retries--;
            }
        }

        // Save to cache before returning
        setCache(textHash, builderData);

        return NextResponse.json(builderData);

    } catch (error) {
        console.error("Auto-Fix API Error:", error);
        return NextResponse.json({ error: error.message || "An error occurred during auto-fix" }, { status: 500 });
    }
}
