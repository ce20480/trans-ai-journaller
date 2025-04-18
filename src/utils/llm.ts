import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const maxRetries = 3; // Maximum number of retry attempts
const initialDelayMs = 1000; // Start with a 1 second delay

// Helper function for delay with exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processWithLLM(
  transcript: string,
  prompt: string = "Generate a summary of this transcript focusing on the most important topics, speakers, decisions, and action items. Format your response as a numbered or bulleted list with each point addressing a separate key insight, idea, or action item. Be concise yet informative.",
  model: string = "gemini-2.0-flash"
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.error("Missing GOOGLE_GENAI_API_KEY environment variable");
    throw new Error("LLM API key not found in environment variables");
  }

  console.log("Starting LLM processing:", {
    model,
    promptLength: prompt.length,
    transcriptLength: transcript.length,
    transcriptPreview: transcript.substring(0, 100) + "...",
    timestamp: new Date().toISOString(),
  });

  // Initialize the API client
  const genAI = new GoogleGenerativeAI(apiKey);
  const generationConfig = {
    temperature: 0.4,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 2048,
  };

  // Set up the model
  const selectedModel = genAI.getGenerativeModel({
    model,
    generationConfig,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  // Combine prompt and transcript
  const fullPrompt = `${prompt}\n\nTranscript:\n${transcript}`;
  console.log("LLM request prepared:", {
    modelName: model,
    generationConfig,
    fullPromptLength: fullPrompt.length,
    requestTimestamp: new Date().toISOString(),
  });

  // Try with retries and exponential backoff
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      attempts++;
      const requestStartTime = Date.now();
      console.log(`LLM Request attempt ${attempts}/${maxRetries} started`);

      const result = await selectedModel.generateContent(fullPrompt);
      const requestDuration = Date.now() - requestStartTime;

      const response = result.response;
      const text = response.text();

      console.log("LLM processing completed successfully:", {
        attempt: attempts,
        requestDuration: `${requestDuration}ms`,
        responseLength: text.length,
        responsePreview: text.substring(0, 100) + "...",
        completionTimestamp: new Date().toISOString(),
      });

      return text;
    } catch (error) {
      console.error(`LLM Request Error (Attempt ${attempts}/${maxRetries}):`, {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });

      if (attempts >= maxRetries) {
        console.error("LLM processing failed after all retry attempts");
        throw error;
      }

      // Calculate delay with exponential backoff: 1s, 2s, 4s, etc.
      const backoffDelay = initialDelayMs * Math.pow(2, attempts - 1);
      console.log(`Retrying LLM request in ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }

  throw new Error("Failed to process with LLM after max retries");
}

/**
 * Generates a tag for a summarized idea using Gemini AI
 * @param summary The summarized text to generate a tag for
 * @returns A single tag (1-2 words) that categorizes the summary
 */
export async function generateTagForIdea(
  summary: string,
  model: string = "gemini-2.0-flash"
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.error("Missing GOOGLE_GENAI_API_KEY environment variable");
    throw new Error("LLM API key not found in environment variables");
  }

  console.log("Starting tag generation:", {
    model,
    summaryLength: summary.length,
    summaryPreview: summary.substring(0, 100) + "...",
    timestamp: new Date().toISOString(),
  });

  // Initialize the API client
  const genAI = new GoogleGenerativeAI(apiKey);
  const generationConfig = {
    temperature: 0.2, // Lower temperature for more predictable outputs
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 16, // We only need a short response
  };

  // Set up the model
  const selectedModel = genAI.getGenerativeModel({
    model,
    generationConfig,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  // Tagging prompt
  const tagPrompt = `Based on the following summarized idea, suggest one short, descriptive tag that categorizes it. Keep it concise (1-2 words max).

Summary: "${summary}"

Respond with just the tag, nothing else. For example: "Productivity" or "Chrome Extension"`;

  // Try with retries and exponential backoff
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      attempts++;
      const requestStartTime = Date.now();
      console.log(`Tag generation attempt ${attempts}/${maxRetries} started`);

      const result = await selectedModel.generateContent(tagPrompt);
      const requestDuration = Date.now() - requestStartTime;

      const response = result.response;
      let tag = response.text().trim();

      // Clean up the tag (remove quotes, periods, etc.)
      tag = tag.replace(/^["']|["']$|\.$|^\s+|\s+$/g, "");

      console.log("Tag generation completed successfully:", {
        attempt: attempts,
        requestDuration: `${requestDuration}ms`,
        tag,
        completionTimestamp: new Date().toISOString(),
      });

      return tag;
    } catch (error) {
      console.error(
        `Tag generation Error (Attempt ${attempts}/${maxRetries}):`,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }
      );

      if (attempts >= maxRetries) {
        console.error("Tag generation failed after all retry attempts");
        throw error;
      }

      // Calculate delay with exponential backoff
      const backoffDelay = initialDelayMs * Math.pow(2, attempts - 1);
      console.log(`Retrying tag generation in ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }

  throw new Error("Failed to generate tag after max retries");
}

// Fallback to another free-tier LLM if needed
export async function processWithFallbackLLM(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _transcription: string
): Promise<string[]> {
  // This would be an implementation using an alternative LLM
  throw new Error("Fallback LLM not implemented yet");
}
