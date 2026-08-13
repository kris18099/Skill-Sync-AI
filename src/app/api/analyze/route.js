import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse-new';
import { NextResponse } from 'next/server';
import { getWorkingModel, invalidateModelCache } from '@/lib/geminiModelResolution';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Robust file-based cache for resume analysis to ensure deterministic results and avoid API calls
const CACHE_FILE = path.join(process.cwd(), '.resume_cache.json');

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

const SYSTEM_PROMPT = `You are SkillSync AI, an expert ATS system and Career Coach. 
Analyze the provided document and determine if it is a resume. If it is NOT a resume, set isResume to false and leave other fields empty.
If it is a resume, perform a deep semantic analysis to extract and infer skills.
You MUST extract skills ONLY from what is literally present in the resume text. Do not assume or infer skills that aren't stated or strongly implied by listed experience. 
CRITICAL RULE: Do not infer a professional job title or years of experience beyond what is explicitly stated in the resume. If the resume shows no work experience entries, clearly label the candidate as a "Fresher/Student" rather than assigning a job title. Use "Fresher — no professional experience" for the experience level instead of ranges like "0-2 Years" if they have no actual work entries. Do not fabricate certifications, job titles, or experience that are not explicitly written in the document.

Output MUST be valid JSON strictly following this schema:
{
  "isResume": boolean,
  "candidateName": "string",
  "profileClassification": "string (e.g. Software Engineer, or 'Fresher/Student')",
  "experienceLevel": "string (e.g. 'Fresher — no professional experience', 2-5 Years, 10+ Years)",
  "profileType": "string (Technical or Non Technical)",
  "extractedSkills": [ { "skill": "string", "snippet": "string" } ],
  "missingSkills": ["string"],
  "recommendedSkills": ["string"],
  "atsChecklist": {
    "hasContactInfo": boolean,
    "hasEducation": boolean,
    "hasSkillsSection": boolean,
    "hasClearFormatting": boolean,
    "hasImpactfulDescriptions": boolean
  },
  "atsSuggestion": "string",
  "roleMatches": [ { "role": "string", "matchPercentage": number } ],
  "roadmap": [ { "title": "string", "description": "string" } ],
  "resumeStrengths": ["string"],
  "resumeWeaknesses": ["string"]
}`;

export async function POST(request) {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
            return NextResponse.json({ error: "Gemini API Key is missing or invalid. Please check your environment variables." }, { status: 500 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Unsupported file format. Please upload PDF or DOCX." }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        let rawText = "";
        if (file.type === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            rawText = pdfData.text;
        } else {
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
        }

        const wordCount = rawText.trim().split(/\s+/).length;
        if (wordCount < 50) {
            return NextResponse.json({ error: "The uploaded document is too short to be a valid resume." }, { status: 400 });
        }

        // --- CACHING LOGIC ---
        const textHash = crypto.createHash('sha256').update(rawText.trim()).digest('hex');
        const cache = getCache();
        if (cache[textHash]) {
            console.log(`[Cache Hit] Returning cached analysis for hash: ${textHash}`);
            const cachedData = cache[textHash];
            cachedData.rawText = rawText;
            return NextResponse.json(cachedData);
        }
        console.log(`[Cache Miss] Running full analysis for hash: ${textHash}`);
        // ---------------------

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        let modelName = await getWorkingModel(process.env.GEMINI_API_KEY);
        let model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_PROMPT
        });

        const liteModel = genAI.getGenerativeModel({ model: modelName });
        const validationPrompt = `Is this document a resume/CV? Answer only YES or NO.\n\nDocument Text:\n${rawText.substring(0, 3000)}`;
        const validationResponse = await liteModel.generateContent(validationPrompt);
        const validationAnswer = validationResponse.response.text().trim().toUpperCase();
        
        if (!validationAnswer.includes("YES")) {
            return NextResponse.json({ error: "This doesn't look like a resume. Please upload a resume in PDF or DOCX format." }, { status: 400 });
        }

        let contentParts = [
            { text: "Please analyze this document based on the system instructions." },
            { text: `Resume Content:\n${rawText}` }
        ];

        let analysisData;
        let retries = 1;
        
        while (retries >= 0) {
            try {
                let response = await model.generateContent({
                    contents: [{ role: "user", parts: contentParts }],
                    generationConfig: {
                        temperature: 0.0, // Strict zero temperature for deterministic output
                        responseMimeType: "application/json"
                    }
                });
                const jsonString = response.response.text();
                analysisData = JSON.parse(jsonString);
                
                if (!analysisData.extractedSkills || !Array.isArray(analysisData.extractedSkills)) {
                    throw new Error("Malformed JSON: extractedSkills is missing or not an array");
                }

                // --- DETERMINISTIC ATS SCORE CALCULATION ---
                let computedScore = 50; // Base score
                if (analysisData.atsChecklist) {
                    if (analysisData.atsChecklist.hasContactInfo) computedScore += 10;
                    if (analysisData.atsChecklist.hasEducation) computedScore += 10;
                    if (analysisData.atsChecklist.hasSkillsSection) computedScore += 10;
                    if (analysisData.atsChecklist.hasClearFormatting) computedScore += 10;
                    if (analysisData.atsChecklist.hasImpactfulDescriptions) computedScore += 10;
                }
                analysisData.atsScore = computedScore;
                // -------------------------------------------

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
                    console.error("[Gemini Error] Google Generative AI API Error after retry:", apiError);
                    return NextResponse.json({ error: "Our AI service is temporarily unavailable, please try again shortly." }, { status: 502 });
                }
                console.warn("[Gemini Retry] Retrying analysis due to error:", apiError.message);
                retries--;
            }
        }

        // Save to cache before returning
        setCache(textHash, analysisData);

        // Include rawText in the final response payload so the client can cache it
        analysisData.rawText = rawText;

        return NextResponse.json(analysisData);

    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: error.message || "An error occurred during analysis" }, { status: 500 });
    }
}
