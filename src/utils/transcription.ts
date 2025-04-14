import { createReadStream } from "fs";
import axios from "axios";

// Using AssemblyAI free tier API for transcription
export async function transcribeFile(filePath: string): Promise<string> {
  try {
    // Check for API key
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error("AssemblyAI API key not found in environment variables");
    }

    // Step 1: Upload the file to AssemblyAI
    const response = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      createReadStream(filePath),
      {
        headers: {
          authorization: apiKey,
          "content-type": "application/octet-stream",
        },
      }
    );

    const uploadUrl = response.data.upload_url;

    // Step 2: Start the transcription process
    const transcriptionResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: uploadUrl,
      },
      {
        headers: {
          authorization: apiKey,
          "content-type": "application/json",
        },
      }
    );

    const transcriptionId = transcriptionResponse.data.id;

    // Step 3: Poll for the transcription result
    let transcription = null;
    while (!transcription || transcription.status !== "completed") {
      const pollingResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
        {
          headers: { authorization: apiKey },
        }
      );

      transcription = pollingResponse.data;

      if (transcription.status === "error") {
        throw new Error(`Transcription error: ${transcription.error}`);
      }

      if (transcription.status !== "completed") {
        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    return transcription.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error(`Failed to transcribe file: ${error.message}`);
  }
}

// Fallback to Whisper if AssemblyAI is unavailable
export async function transcribeWithWhisper(filePath: string): Promise<string> {
  // This would be an implementation using Whisper or another alternative
  throw new Error("Whisper transcription not implemented yet");
}
