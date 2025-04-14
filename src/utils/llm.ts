import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processWithLLM(transcription: string): Promise<string[]> {
  try {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found in environment variables");
    }

    // Initialize the Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `Extract the main points from this transcription in a bulleted list format. Focus on key ideas, important facts, and actionable insights:

${transcription}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("LLM response was empty");
    }

    // Parse the bulleted list into an array
    const points = text
      .split("\n")
      .filter(
        (line: string) =>
          line.trim().startsWith("•") || line.trim().startsWith("-")
      )
      .map((line: string) => line.replace(/^[•-]\s*/, "").trim());

    return points;
  } catch (error: unknown) {
    console.error("LLM processing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to process with LLM: ${errorMessage}`);
  }
}

// Fallback to another free-tier LLM if needed
export async function processWithFallbackLLM(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _transcription: string
): Promise<string[]> {
  // This would be an implementation using an alternative LLM
  throw new Error("Fallback LLM not implemented yet");
}
