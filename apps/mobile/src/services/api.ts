import axios from "axios";
import { Note } from "../types";
import Constants from "expo-constants";
import supabase from "../supabaseClient";

// Set the API base URL based on environment
const baseURL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:3000";

const api = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds for transcription requests
});

// Define the NoteAnalysis interface
export interface NoteAnalysis {
  summary: string[];
  suggestedTag: string;
}

export default {
  /**
   * Get all notes for a user
   */
  async getNotes(userId: string, jwtToken: string | null): Promise<Note[]> {
    try {
      console.log(`[API] Getting notes for user: ${userId}`);
      console.log(`[API] JWT token available: ${jwtToken ? "yes" : "no"}`);

      if (!jwtToken) {
        console.warn("[API] No JWT token provided for getNotes request");
        throw new Error("Authentication token missing");
      }

      const response = await api.get(`/api/notes?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const notes = response.data?.data || [];
      console.log(`[API] Successfully fetched ${notes.length} notes`);
      return notes;
    } catch (error) {
      console.error("[API] Error getting notes:", error);
      throw error;
    }
  },

  /**
   * Upload audio recording to server
   */
  async uploadRecording(
    audioUri: string,
    userId: string,
    jwtToken: string | null
  ): Promise<{ filename: string; uploadUrl: string }> {
    try {
      console.log(`[API] Uploading recording for user: ${userId}`);
      console.log(`[API] JWT token available: ${jwtToken ? "yes" : "no"}`);
      console.log(`[API] Audio URI: ${audioUri}`);

      if (!jwtToken) {
        console.warn("[API] No JWT token provided for uploadRecording request");
        throw new Error("Authentication token missing");
      }

      // First, fetch the file content
      const response = await fetch(audioUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file from ${audioUri}`);
      }

      // Get the file content as a blob
      const audioBlob = await response.blob();
      console.log(
        `[API] Got audio file as blob, size: ${audioBlob.size} bytes`
      );

      // Create a custom endpoint for uploading as binary data
      const uploadResponse = await fetch(`${baseURL}/api/upload-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/m4a",
          Authorization: `Bearer ${jwtToken}`,
          "X-User-ID": userId,
        },
        body: audioBlob,
      });

      // Handle response
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(
          `[API] Upload failed with status: ${uploadResponse.status}`,
          errorText
        );
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      const responseData = await uploadResponse.json();
      console.log(
        "[API] Successfully uploaded recording:",
        responseData.filename
      );
      return {
        filename: responseData.filename,
        uploadUrl: responseData.uploadUrl,
      };
    } catch (error) {
      console.error("[API] Error uploading recording:", error);
      throw error;
    }
  },

  /**
   * Transcribe audio and return text
   */
  async transcribeAudio(
    filename: string,
    userId: string,
    jwtToken: string | null
  ): Promise<string> {
    try {
      console.log(`[API] Transcribing audio for user: ${userId}`);
      console.log(`[API] JWT token available: ${jwtToken ? "yes" : "no"}`);
      console.log(`[API] Filename: ${filename}`);

      if (!jwtToken) {
        console.warn("[API] No JWT token provided for transcribeAudio request");
        throw new Error("Authentication token missing");
      }

      // First check if we have an uploadUrl from a direct upload
      let uploadUrl = null;

      // The filename could be an actual filename or it could contain the uploadUrl
      if (filename && filename.includes("uploadUrl=")) {
        // Extract uploadUrl from the filename if it's embedded
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

      const response = await api.post(
        "/api/transcribe",
        {
          filename,
          uploadUrl, // Pass uploadUrl if we have it
          user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      // Response may have either 'transcription' or 'text' field
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
  async analyzeSummary(
    text: string,
    userId: string,
    jwtToken: string | null
  ): Promise<NoteAnalysis> {
    try {
      console.log(`[API] Analyzing text for user: ${userId}`);
      console.log(`[API] JWT token available: ${jwtToken ? "yes" : "no"}`);

      if (!jwtToken) {
        console.warn("[API] No JWT token provided for analyzeSummary request");
        throw new Error("Authentication token missing");
      }

      const response = await api.post(
        "/api/analyze",
        { text, user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log("[API] Successfully analyzed text");

      // Handle potential field name variations
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
  async saveNote(note: Partial<Note>, jwtToken: string | null): Promise<Note> {
    try {
      console.log("[API] Saving note:", note.title);
      console.log(`[API] JWT token available: ${jwtToken ? "yes" : "no"}`);

      if (!jwtToken) {
        console.warn("[API] No JWT token provided for saveNote request");
        throw new Error("Authentication token missing");
      }

      const response = await api.post("/api/notes", note, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

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
  async deleteNote(
    noteId: string,
    userId: string,
    jwtToken: string | null
  ): Promise<void> {
    try {
      console.log(`[API] Deleting note: ${noteId}`);
      console.log(`[API] JWT token available: ${jwtToken ? "yes" : "no"}`);

      if (!jwtToken) {
        console.warn("[API] No JWT token provided for deleteNote request");
        throw new Error("Authentication token missing");
      }

      await api.delete(`/api/notes`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        data: {
          id: noteId,
          user_id: userId,
        },
      });

      console.log("[API] Successfully deleted note");
    } catch (error) {
      console.error("[API] Error deleting note:", error);
      throw error;
    }
  },

  /**
   * Process a recording end-to-end (upload, transcribe, analyze, and save)
   */
  async processRecording(
    audioUri: string,
    userId: string,
    jwtToken: string | null
  ): Promise<{ tag: string }> {
    try {
      console.log(`[API] Processing recording for user: ${userId}`);
      console.log(`[API] JWT token available: ${jwtToken ? "yes" : "no"}`);

      if (!jwtToken) {
        console.warn(
          "[API] No JWT token provided for processRecording request"
        );
        throw new Error("Authentication token missing");
      }

      // 1. Upload recording
      console.log("[API] Step 1: Uploading recording...");
      const { filename, uploadUrl } = await this.uploadRecording(
        audioUri,
        userId,
        jwtToken
      );
      console.log("[API] Upload complete with filename:", filename);

      // Create a parameterized filename if we have an uploadUrl
      const transcriptionId = uploadUrl
        ? `${filename}?uploadUrl=${encodeURIComponent(uploadUrl)}`
        : filename;

      // 2. Transcribe audio
      console.log("[API] Step 2: Transcribing audio...");
      const transcription = await this.transcribeAudio(
        transcriptionId,
        userId,
        jwtToken
      );
      console.log(
        "[API] Transcription complete, length:",
        transcription.length
      );

      // 3. Analyze the transcription
      console.log("[API] Step 3: Analyzing the transcription...");
      const analysis = await this.analyzeSummary(
        transcription,
        userId,
        jwtToken
      );
      console.log("[API] Analysis complete with tag:", analysis.suggestedTag);

      // 4. Save the note
      console.log("[API] Step 4: Saving the note...");
      const note = await this.saveNote(
        {
          title: `Journal Entry - ${new Date().toLocaleDateString()}`,
          content: transcription,
          summary: analysis.summary.join(" "),
          tag: analysis.suggestedTag,
          user_id: userId,
        },
        jwtToken
      );
      console.log("[API] Note saved with ID:", note.id);

      return { tag: note.tag || analysis.suggestedTag || "General" };
    } catch (error) {
      console.error("[API] Error processing recording:", error);
      throw error;
    }
  },
};
