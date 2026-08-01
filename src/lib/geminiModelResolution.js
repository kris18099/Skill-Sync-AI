let cachedModel = null;
let cacheExpiration = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export function invalidateModelCache() {
    cachedModel = null;
    cacheExpiration = 0;
}

export async function getWorkingModel(apiKey) {
    if (cachedModel && Date.now() < cacheExpiration) {
        return cachedModel;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch models list, status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const preference = process.env.GEMINI_MODEL_PREFERENCE || "flash";
        
        // Filter out models that don't support generateContent, or are preview/experimental
        let validModels = (data.models || []).filter(model => {
            if (!model.supportedGenerationMethods || !model.supportedGenerationMethods.includes("generateContent")) return false;
            if (model.name.includes("preview") || model.name.includes("exp")) return false;
            return true;
        });

        // Try to filter by preference
        const preferredModels = validModels.filter(m => m.name.includes(preference));
        if (preferredModels.length > 0) {
            validModels = preferredModels;
        }

        // Sort dynamically (descending localeCompare puts gemini-2.5 before gemini-1.5)
        validModels.sort((a, b) => b.name.localeCompare(a.name));

        if (validModels.length === 0) {
            throw new Error("No valid models found matching criteria.");
        }

        // Return just the model name stripped of 'models/' prefix, as getGenerativeModel expects 'gemini-X'
        let selectedModel = validModels[0].name;
        if (selectedModel.startsWith("models/")) {
            selectedModel = selectedModel.replace("models/", "");
        }

        if (cachedModel !== selectedModel) {
            console.log(`[Gemini Discovery] Model changed from ${cachedModel || "none"} to ${selectedModel}`);
        }

        cachedModel = selectedModel;
        cacheExpiration = Date.now() + CACHE_DURATION;

        return cachedModel;
    } catch (error) {
        console.error("[Gemini Discovery] Error dynamically resolving Gemini model:", error);
        // Fallback to a hardcoded safe model if dynamic discovery completely fails
        return "gemini-1.5-flash"; 
    }
}
