"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssessment = generateAssessment;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
const promptBuilder_1 = require("./promptBuilder");
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.config.geminiKey);
const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000;
// ===============================
// Safe JSON parser helper
// ===============================
function safeParseJSON(input) {
    try {
        return JSON.parse(input);
    }
    catch (err) {
        console.error("Failed to parse AI JSON:", err);
        console.error("Raw AI output causing failure:", input);
        return null;
    }
}
// ===============================
// Clean AI output
// ===============================
function cleanAIOutput(raw) {
    let cleaned = raw.trim();
    // remove markdown wrappers
    if (cleaned.startsWith("```json"))
        cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```"))
        cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```"))
        cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();
    // auto-fix unquoted keys: {title: "Math"} → {"title": "Math"}
    cleaned = cleaned.replace(/([{\[,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    return cleaned;
}
// ===============================
// Generate Assessment
// ===============================
async function generateAssessment(input) {
    const prompt = (0, promptBuilder_1.buildPrompt)(input);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `You are a professional exam paper creator. Always respond with valid JSON only. No markdown formatting, no code blocks, just raw JSON.\n\n${prompt}`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4000,
                },
            }, { signal: controller.signal });
            clearTimeout(timeoutId);
            const raw = result.response.text();
            if (!raw || !raw.trim())
                throw new Error("Empty response from AI");
            const cleaned = cleanAIOutput(raw);
            const parsed = safeParseJSON(cleaned);
            if (!parsed || !parsed.sections || !Array.isArray(parsed.sections)) {
                throw new Error("Invalid paper structure from AI");
            }
            // Fix question numbers and validate fields
            let qNum = 1;
            for (const section of parsed.sections) {
                if (!section.questions || !Array.isArray(section.questions)) {
                    section.questions = [];
                    continue;
                }
                for (const q of section.questions) {
                    q.questionNumber = qNum++;
                    if (!["easy", "medium", "hard"].includes(q.difficulty)) {
                        q.difficulty = "medium";
                    }
                    if (!["mcq", "short", "long", "true_false", "fill_blank"].includes(q.type)) {
                        q.type = "short";
                    }
                }
            }
            return parsed;
        }
        catch (error) {
            const err = error;
            console.error(`AI generation failed (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
            if (attempt === MAX_RETRIES) {
                if (err.message.includes("JSON") || err.message.includes("parse")) {
                    throw new Error("Failed to parse AI response. Please try again.");
                }
                else {
                    throw new Error(`AI service error: ${err.message}. Please try again later.`);
                }
            }
            // small delay before retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }
    throw new Error("Unexpected fall-through in generateAssessment");
}
//# sourceMappingURL=aiService.js.map