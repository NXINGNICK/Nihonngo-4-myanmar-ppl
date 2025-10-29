
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // In a real app, you might show a UI message instead of throwing.
    // For this environment, we assume the key is present.
    console.error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const BASE_PROMPT = `You are a friendly and expert Japanese language tutor, fluent in both Japanese and conversational Burmese. Your student is from Myanmar and is learning Japanese from English textbooks. Your explanations must be in natural, everyday Burmese that a young person would use, not overly formal or academic.

Follow the specific formatting instructions for each task precisely. Use markdown for emphasis where appropriate.
`;

export const explainGrammar = async (input: string | File): Promise<string> => {
    try {
        const parts: Part[] = [];
        let promptText = `Analyze the following Japanese content. Identify every grammar pattern present, including simple particles, verb conjugations, and complex structures. Handle multiple and overlapping patterns.

Start your entire response with the exact line: "Grammar form. Found."

Then, for each distinct grammar pattern you identify, provide the following format:
- A line with the grammar structure in its general, dictionary form, enclosed in bold markdown (e.g., **V-る + 始める**, **N + から**).
- Following that, a concise explanation (3-8 sentences) in natural, conversational Burmese about the grammar's meaning and usage.

Separate each grammar pattern entry with a horizontal rule (---).

Example for input "朝8時から富士山に登る始めた。":
Grammar form. Found.

**N(time) + から**
(Explanation in Burmese...)
---
**V-る + 始める**
(Explanation in Burmese...)

Content to analyze is below:
---
`;

        if (typeof input === 'string') {
            parts.push({ text: `${promptText}${input}` });
        } else {
            const imagePart = await fileToGenerativePart(input);
            parts.push({ text: promptText }, imagePart);
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                systemInstruction: BASE_PROMPT,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error explaining grammar:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
        return "An unknown error occurred while explaining grammar.";
    }
};

export const explainVocabulary = async (word: string): Promise<string> => {
    try {
        const prompt = `Explain the Japanese vocabulary word: **${word}**

Provide the following:
1.  **Definition (Burmese):** A clear definition in natural, conversational Burmese. Explain any nuances.
2.  **Example Sentences:** Provide two distinct examples of how to use this word. For each example, include:
    *   Japanese sentence (with furigana).
    *   Romaji transliteration.
    *   A natural Burmese translation.
`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: BASE_PROMPT,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error explaining vocabulary:", error);
         if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
        return "An unknown error occurred while explaining vocabulary.";
    }
};
