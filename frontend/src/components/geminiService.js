import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyAxeVN400woqbRiAGyL5J2I7NILHh4hr4Q");
export const genai = genAI;

let model = null;

// ✅ Step 1: Initialize Gemini model
export async function initializeModel() {
  const modelNames = [
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-1.5-flash-8b",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-pro"
  ];

  for (const name of modelNames) {
    try {
      model = genai.getGenerativeModel({
        model: name,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });
      console.log(`✅ Gemini model initialized: ${name}`);
      break;
    } catch (err) {
      console.warn(`❌ Failed to initialize ${name}:`, err.message);
    }
  }

  if (!model) throw new Error("❌ No Gemini model could be initialized.");
}

// ✅ Step 2: Redact personal info
export function redactPersonalInfo(text) {
  return text
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[REDACTED_EMAIL]")
    .replace(/(\+91[-\s]?|0)?\d{10,}/g, "[REDACTED_PHONE]")
    .replace(/https?:\/\/[^\s]+/gi, "[REDACTED_URL]")
    .replace(/(name|full name)\s*[:-]\s*[A-Za-z .]+/gi, "[REDACTED_NAME]")
.replace(/(contact number|phone|mobile|contact)\s*[:-]?\s*\+?\d{10,}/gi, "[REDACTED_PHONE]")
.replace(/(address|location)\s*[:-]?\s*.*/gi, "[REDACTED_ADDRESS]")
}

// ✅ Step 3: Resume vs JD analysis
export async function analyzeWithGemini(resumeText, jdText) {
  if (!model) await initializeModel();
  const redactedResume = redactPersonalInfo(resumeText);

  const prompt = `
You are a resume analysis expert.

Your task is to evaluate how well the resume matches the job description. Return your output in **this strict format** (no extra text):

---
Matching Score: X%

Missing Keywords: ["react js", "sql", "javascript", "python"]

Suggestions:
- Suggestion 1
- Suggestion 2
- Suggestion 3
---

Resume:
${redactedResume}

Job Description:
${jdText}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    const match = text.match(/---([\s\S]*?)---/);
    return match ? match[1].trim() : text.trim();
  } catch (err) {
    console.error("❌ Gemini error:", err);
    throw new Error("Gemini API Error: " + err.message);
  }
}

// ✅ Step 4: Parse Gemini response
export function parseGeminiResponse(responseText) {
  try {
    console.log("🧠 Raw Gemini response:", responseText);

    // Match score
    const scoreMatch = responseText.match(/(Matching Score|Score):\s*(\d+)%?/i);
    const score = scoreMatch ? parseInt(scoreMatch[2], 10) : 0;

    // Match missing keywords (either list or sentence format)
    let keywords = [];
    const listMatch = responseText.match(/Missing Keywords:\s*\[(.*?)\]/is);
    if (listMatch) {
      keywords = listMatch[1]
        .split(',')
        .map(k => k.replace(/['"\n\r]/g, '').trim())
        .filter(Boolean);
    } else {
      const sentenceMatch = responseText.match(/missing (skills|keywords)[\s:]*([\w\s,]+)/i);
      if (sentenceMatch) {
        keywords = sentenceMatch[2]
          .split(',')
          .map(k => k.trim())
          .filter(Boolean);
      }
    }

    // Match suggestions
    const suggestionsMatch = responseText.match(/Suggestions:\s*((?:- .+\n?)*)/);
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1].split('\n').map(line => line.replace(/^-\s*/, '').trim()).filter(Boolean)
      : [];

    console.log("✅ Parsed score:", score);
    console.log("✅ Parsed missing keywords:", keywords);
    console.log("✅ Parsed suggestions:", suggestions);

    return { score, missing_keywords: keywords, suggestions };
  } catch (e) {
    console.error("❌ Parse error:", e);
    return null;
  }
}


// ✅ Step 5: Learning resources for missing skills
export async function getLearningResourcesFromGemini(missingKeywords) {
  if (!model) await initializeModel();
  if (!missingKeywords.length) return [];

  const prompt = `
Give one helpful and free online resource for each of the following skills in JSON format:

Skills: ${missingKeywords.join(', ')}

Return format:
[
  { "skill": "React", "resource": "https://..." },
  { "skill": "Node.js", "resource": "https://..." }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const json = text.match(/\[\s*{[\s\S]*}\s*\]/);
    return json ? JSON.parse(json[0].replace(/'/g, '"')) : [];
  } catch (e) {
    console.error("❌ Resource fetch failed:", e);
    return [];
  }
}
