const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
process.env.GEMINI_API_KEY = env.split('GEMINI_API_KEY=')[1].split('\n')[0].trim();

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let modelOptions = { 
        model: 'gemini-2.5-flash',
        tools: [{ googleSearch: {} }] // Enable Google Search grounding
    };
    let model = genAI.getGenerativeModel(modelOptions);

    let retries = 1;
    while (retries >= 0) {
        try {
            let response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: "Hello" }] }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            });
            console.log("Success!");
            break;
        } catch (apiError) {
            const errorMessage = apiError.message || "";
            if (errorMessage.toLowerCase().includes("unsupported") || errorMessage.toLowerCase().includes("tools")) {
                console.warn("[Gemini Fallback] Grounding failed, retrying without tools.");
                modelOptions = { model: 'gemini-2.5-flash' };
                model = genAI.getGenerativeModel(modelOptions);
                continue;
            }
            console.error("Failed:", errorMessage);
            break;
        }
    }
}
test();
