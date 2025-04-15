import { createReadStream } from "fs";
import axios, { AxiosError } from "axios";
import fs from "fs";

// Helper function for exponential backoff retry
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Using AssemblyAI free tier API for transcription
export async function transcribeFile(
  filePath: string,
  maxRetries = 3
): Promise<string> {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      // Check for API key
      const apiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "AssemblyAI API key not found in environment variables"
        );
      }

      // Step 1: Upload the file to AssemblyAI
      console.log(`Attempt ${attempts + 1}: Uploading file to AssemblyAI...`, {
        filePath,
        fileSize: `${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(
          2
        )}MB`,
      });
      const uploadResponse = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        createReadStream(filePath),
        {
          headers: {
            authorization: apiKey,
            "content-type": "application/octet-stream",
          },
        }
      );
      const uploadUrl = uploadResponse.data.upload_url;
      console.log("AssemblyAI upload successful:", {
        uploadUrl,
        responseStatus: uploadResponse.status,
        responseHeaders: uploadResponse.headers,
      });

      // Step 2: Start the transcription process
      console.log("Starting AssemblyAI transcription...", {
        audioUrl: uploadUrl,
        requestTimestamp: new Date().toISOString(),
      });
      const transcriptionResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { audio_url: uploadUrl },
        {
          headers: {
            authorization: apiKey,
            "content-type": "application/json",
          },
        }
      );
      const transcriptionId = transcriptionResponse.data.id;
      console.log("AssemblyAI transcription started:", {
        transcriptionId,
        responseData: transcriptionResponse.data,
        status: transcriptionResponse.status,
      });

      // Step 3: Poll for the transcription result
      console.log("Polling for AssemblyAI transcription result...");
      let transcriptionResult = null;
      let pollAttempts = 0;
      const maxPollAttempts = 20;

      while (pollAttempts < maxPollAttempts) {
        pollAttempts++;
        const pollingStartTime = Date.now();
        const pollingResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
          { headers: { authorization: apiKey } }
        );
        const pollingDuration = Date.now() - pollingStartTime;
        transcriptionResult = pollingResponse.data;

        if (transcriptionResult.status === "completed") {
          console.log("AssemblyAI transcription completed:", {
            transcriptionId,
            processingTime: transcriptionResult.processing_time,
            audioLength: transcriptionResult.audio_duration,
            wordCount: transcriptionResult.words?.length || 0,
            confidence: transcriptionResult.confidence,
            textLength: transcriptionResult.text?.length || 0,
          });
          console.log("Transcription result:", transcriptionResult.text);
          return transcriptionResult.text;
        }

        if (transcriptionResult.status === "error") {
          throw new Error(`Transcription error: ${transcriptionResult.error}`);
        }

        // Wait before polling again
        console.log(
          `Transcription status: ${transcriptionResult.status}, polling again in 3s...`,
          {
            pollAttempt: pollAttempts,
            maxAttempts: maxPollAttempts,
            transcriptionId,
            pollResponseTime: pollingDuration,
            currentProgress: transcriptionResult.status,
          }
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      throw new Error("Transcription polling timed out.");
    } catch (error: unknown) {
      attempts++;
      console.error(
        `AssemblyAI Transcription Error (Attempt ${attempts}/${maxRetries}):`,
        error
      );

      const isRetryable =
        error instanceof AxiosError &&
        error.response &&
        (error.response.status >= 500 || error.response.status === 429);

      if (isRetryable && attempts < maxRetries) {
        const delayTime = Math.pow(2, attempts) * 1000;
        console.log(`Retrying AssemblyAI request in ${delayTime / 1000}s...`);
        await delay(delayTime);
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown AssemblyAI error";
        throw new Error(
          `Failed to transcribe file after ${attempts} attempts: ${errorMessage}`
        );
      }
    }
  }
  throw new Error("Failed to transcribe file after max retries.");
}

// Fallback to Whisper if AssemblyAI is unavailable
export async function transcribeWithWhisper(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _filePath: string
): Promise<string> {
  // This would be an implementation using Whisper or another alternative
  throw new Error("Whisper transcription not implemented yet");
}
