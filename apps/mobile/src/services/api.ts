import axios from "axios";
import { Note } from "../types";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Set the API base URL based on environment and platform
const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const defaultApiUrl = `http://${defaultHost}:3000`;
// Read API URL from EAS expoConfig or from Expo Go manifest2/manifest, then default
const expoExtra = Constants.expoConfig?.extra as { apiUrl?: string };
const manifest2Extra = (Constants.manifest2 as any)?.extra as {
  apiUrl?: string;
};
const manifestExtra = (Constants.manifest as any)?.extra as { apiUrl?: string };
// const baseURL =
//   expoExtra?.apiUrl ||
//   manifest2Extra?.apiUrl ||
//   manifestExtra?.apiUrl ||
//   defaultApiUrl;
const baseURL = "https://www.thoughts2action.com";

const api = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds for requests
});

// Allow setting the Bearer token once for all requests
export function setBearerToken(token?: string) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Define the NoteAnalysis interface
export interface NoteAnalysis {
  summary: string[];
  suggestedTag: string;
}

export default {
  /**
   * Get all notes for the authenticated user
   */
  async getNotes(): Promise<Note[]> {
    try {
      console.log("[API] Fetching notes...");
      const response = await api.get("/api/notes");

      const notes = response.data?.data || [];
      return notes;
    } catch (error) {
      console.error("[API] Error getting notes:", error);
      throw error;
    }
  },

  /**
   * Upload audio recording to server using native streaming
   */
  async uploadRecording(
    audioUri: string
  ): Promise<{ filename: string; uploadUrl: string }> {
    // Stream upload natively via Expo FileSystem
    const bearer = api.defaults.headers.common["Authorization"];
    if (!bearer || typeof bearer !== "string") {
      throw new Error("Bearer token not set");
    }
    const uploadUrl = `${baseURL}/api/upload`;
    const result = await FileSystem.uploadAsync(uploadUrl, audioUri, {
      httpMethod: "POST",
      headers: {
        "Content-Type": "audio/m4a",
        Authorization: bearer,
      },
    });
    if (result.status !== 200) {
      throw new Error(`Upload failed: ${result.status} ${result.body}`);
    }
    return JSON.parse(result.body) as { filename: string; uploadUrl: string };
  },

  /**
   * Transcribe audio and return text
   */
  async transcribeAudio(filename: string): Promise<string> {
    try {
      console.log("[API] Transcribing audio...");
      console.log(`[API] Filename: ${filename}`);

      let uploadUrl = null;
      if (filename && filename.includes("uploadUrl=")) {
        try {
          const params = new URLSearchParams(filename.split("?")[1]);
          uploadUrl = params.get("uploadUrl");
          console.log(
            `[API] Found uploadUrl in filename: ${uploadUrl?.substring(0, 20)}...`
          );
        } catch (e) {
          console.error("[API] Error extracting uploadUrl from filename:", e);
        }
      }

      const response = await api.post("/api/transcribe", {
        filename,
        uploadUrl,
      });

      const transcription =
        response.data.transcription || response.data.text || "";
      console.log(
        "[API] Successfully transcribed audio, length:",
        transcription.length
      );
      return transcription;
    } catch (error) {
      console.error("[API] Error transcribing audio:", error);
      throw error;
    }
  },

  /**
   * Analyze transcription and return note analysis
   */
  async analyzeSummary(text: string): Promise<NoteAnalysis> {
    try {
      console.log("[API] Analyzing text...");

      const response = await api.post("/api/analyze", { text });

      console.log("[API] Successfully analyzed text");

      const summary = Array.isArray(response.data.summary)
        ? response.data.summary
        : [];

      const suggestedTag = response.data.suggestedTag || "General";

      return { summary, suggestedTag };
    } catch (error) {
      console.error("[API] Error analyzing text:", error);
      throw error;
    }
  },

  /**
   * Save a note to the database
   */
  async saveNote(note: Partial<Note>): Promise<Note> {
    try {
      console.log("[API] Saving note...");

      const response = await api.post("/api/notes", note);

      console.log("[API] Successfully saved note:", response.data.id);
      return response.data;
    } catch (error) {
      console.error("[API] Error saving note:", error);
      throw error;
    }
  },

  /**
   * Delete a note from the database
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      console.log("[API] Deleting note...");

      await api.delete("/api/notes", { data: { id: noteId } });

      console.log("[API] Successfully deleted note");
    } catch (error) {
      console.error("[API] Error deleting note:", error);
      throw error;
    }
  },

  /**
   * Process a recording end-to-end (upload, transcribe, analyze, and save)
   */
  async processRecording(audioUri: string): Promise<{ tag: string }> {
    try {
      console.log("[API] Processing recording...");

      // 1. Upload recording
      console.log("[API] Step 1: Uploading recording...");
      const { filename, uploadUrl } = await this.uploadRecording(audioUri);
      console.log("[API] Upload complete with filename:", filename);

      // Create a parameterized filename if we have an uploadUrl
      const transcriptionId = uploadUrl
        ? `${filename}?uploadUrl=${encodeURIComponent(uploadUrl)}`
        : filename;

      // 2. Transcribe audio
      console.log("[API] Step 2: Transcribing audio...");
      const transcription = await this.transcribeAudio(transcriptionId);
      console.log(
        "[API] Transcription complete, length:",
        transcription.length
      );

      // 3. Analyze the transcription
      console.log("[API] Step 3: Analyzing transcription...");
      const analysis = await this.analyzeSummary(transcription);
      console.log("[API] Analysis complete with tag:", analysis.suggestedTag);

      // 4. Save the note
      console.log("[API] Step 4: Saving the note...");
      const note = await this.saveNote({
        title: `Journal Entry - ${new Date().toLocaleDateString()}`,
        content: transcription,
        summary: analysis.summary.join(" "),
        tag: analysis.suggestedTag,
      });
      console.log("[API] Note saved with ID:", note.id);

      return { tag: note.tag || analysis.suggestedTag || "General" };
    } catch (error) {
      console.error("[API] Error processing recording:", error);
      throw error;
    }
  },
};
