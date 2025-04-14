import axios from "axios";

export async function processWithLLM(transcription: string): Promise<string[]> {
  try {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found in environment variables");
    }

    // Process with Gemini 2.5 Pro API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Extract the main points from this transcription in a bulleted list format. Focus on key ideas, important facts, and actionable insights:
                
                ${transcription}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
      }
    );

    // Extract main points from the response
    const content = response.data.candidates[0].content;
    const text = content.parts[0].text;

    // Parse the bulleted list into an array
    const points = text
      .split("\n")
      .filter(
        (line) => line.trim().startsWith("•") || line.trim().startsWith("-")
      )
      .map((line) => line.replace(/^[•-]\s*/, "").trim());

    return points;
  } catch (error) {
    console.error("LLM processing error:", error);
    throw new Error(`Failed to process with LLM: ${error.message}`);
  }
}

// Fallback to another free-tier LLM if needed
export async function processWithFallbackLLM(
  transcription: string
): Promise<string[]> {
  // This would be an implementation using an alternative LLM
  throw new Error("Fallback LLM not implemented yet");
}
