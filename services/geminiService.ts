// src/services/geminiService.ts
interface SkinConditionData {
  condition: string;
  confidence: number;
  severity: string;
}

interface TreatmentRecommendation {
  title: string;
  description: string;
  icon: string;
}

interface SkinConditionAnalysis {
  condition: string;
  confidence: number;
  severity: string;
  description: string;
  symptoms: string[];
  recommendations: TreatmentRecommendation[];
  _error?: string;
}

interface GeminiError extends Error {
  status?: number;
}

const createPrompt = (data: SkinConditionData): string => `
Analyze this skin condition:
- Condition: ${data.condition}
- Confidence: ${data.confidence}%
- Severity: ${data.severity}

Respond in this JSON format:
{
  "condition": "${data.condition}",
  "confidence": ${data.confidence},
  "severity": "${data.severity}",
  "description": "brief 1-sentence description",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "recommendations": [
    {
      "title": "short title",
      "description": "brief tip",
      "icon": "icon-name (Material Community Icon React native, if no fitting icon then default to 'lightbulb-outline')"
    }
  ]
}`;

const parseResponse = (text: string): SkinConditionAnalysis => {
  try {
    const jsonString = text.match(/\{[\s\S]*\}/)?.[0] || "{}";
    const data = JSON.parse(jsonString);

    return {
      condition: data.condition || "Unknown",
      confidence: data.confidence || 0,
      severity: data.severity || "Unknown",
      description: data.description || "No description available",
      symptoms: data.symptoms || ["Itching", "Redness", "Rash"],
      recommendations:
        data.recommendations || getFallbackRecommendations().recommendations,
    };
  } catch (error) {
    console.error("Error parsing response:", error);
    return getFallbackRecommendations();
  }
};

const getFallbackRecommendations = (options?: {
  errorMessage?: string;
}): SkinConditionAnalysis => ({
  condition: "Eczema",
  confidence: 0,
  severity: "Unknown",
  description: "Common skin condition causing itchy, inflamed skin",
  symptoms: ["Itching", "Redness", "Dry skin"],
  recommendations: [
    {
      title: "Moisturize",
      description: "Use fragrance-free moisturizer daily",
      icon: "droplet",
    },
    {
      title: "Avoid scratching",
      description: "Keep nails short to prevent skin damage",
      icon: "alert-circle",
    },
  ],
  _error: options?.errorMessage,
});

const apiKey = "AIzaSyA3nR00Yr_S-ldY3DjtG3RCsEeIaKmxVVc";

export const getSkinConditionAnalysis = async (
  data: SkinConditionData
): Promise<SkinConditionAnalysis> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    if (!apiKey) {
      throw new Error("Missing API configuration");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: createPrompt(data) }] }],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: GeminiError = new Error(
        `API request failed with status ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) throw new Error("Empty response from API");

    return parseResponse(text);
  } catch (error) {
    console.error("API Error:", error);

    if ((error as GeminiError).status === 429) {
      return getFallbackRecommendations({
        errorMessage: "API limit exceeded. Showing sample data.",
      });
    }

    return getFallbackRecommendations();
  }
};
