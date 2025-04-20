"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { FREE_NOTES_LIMIT } from "@/utils/constants";

export default function Dashboard() {
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "uploading" | "transcribing" | "analyzing" | "saving"
  >("idle");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [summary, setSummary] = useState<string[]>([]);
  const [suggestedTag, setSuggestedTag] = useState<string>("");
  const [customTag, setCustomTag] = useState<string>("");
  const [isEditingTag, setIsEditingTag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Add user profile state
  const [userProfile, setUserProfile] = useState<{
    subscription_status?: string;
    free_notes_count?: number;
    isAdmin?: boolean;
  }>({});

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);

        // Fetch user profile data for debugging
        const response = await fetch(`/api/notes?user_id=${user.id}`);
        const responseData = await response.json();
        if (responseData?.userProfile) {
          setUserProfile({
            subscription_status: responseData.userProfile.subscription_status,
            free_notes_count: responseData.userProfile.free_notes_count,
            isAdmin: responseData.userProfile.role === "admin",
          });
          console.log("User profile loaded:", responseData.userProfile);
        }
      } catch (err: unknown) {
        console.error("Authentication check failed:", err);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  // Cleanup audio recording resources on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  // Format recording time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      setError(null);
      setErrorDetails(null);

      // Reset previous recording if exists
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      setAudioBlob(null);
      setFile(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(url);

        // Convert to File object for upload
        const fileName = `recording_${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.webm`;
        const audioFile = new File([audioBlob], fileName, {
          type: "audio/webm",
        });
        setFile(audioFile);

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);

      // Provide more specific error messages for permission issues
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied");
        setErrorDetails(
          "Please allow microphone access in your browser settings and refresh the page."
        );
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("No microphone found");
        setErrorDetails("Please connect a microphone and try again.");
      } else {
        setError("Could not access microphone");
        setErrorDetails(err instanceof Error ? err.message : "Unknown error");
      }
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      // Clear any existing recording
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
        setAudioBlob(null);
      }

      setFile(e.target.files[0]);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Please select a file or record audio");
      return;
    }

    setError(null);
    setErrorDetails(null);
    setIsUploading(true);
    setCurrentStep("uploading");

    try {
      // ─── 1) STREAM UPLOAD ─────────────────────────────────────────────
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok) {
        const msg = uploadJson.error || "Upload failed";
        throw new Error(msg, { cause: uploadJson.details });
      }
      const { uploadUrl } = uploadJson;
      console.log("Received uploadUrl:", uploadUrl);

      // ─── 2) TRANSCRIBE ────────────────────────────────────────────────
      setCurrentStep("transcribing");
      setIsProcessing(true);

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadUrl }),
      });
      const transcribeJson = await transcribeRes.json();

      if (!transcribeRes.ok) {
        const msg = transcribeJson.error || "Transcription failed";
        throw new Error(msg, { cause: transcribeJson.details });
      }
      const transcription = transcribeJson.transcription;
      console.log("Transcription completed:", transcription);

      // ─── 3) LLM ANALYSIS ──────────────────────────────────────────────
      setCurrentStep("analyzing");

      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
      });
      const summarizeJson = await summarizeRes.json();

      if (!summarizeRes.ok) {
        const msg = summarizeJson.error || "Summarization failed";
        throw new Error(msg, { cause: summarizeJson.details });
      }
      const summaryArray = summarizeJson.summary;
      if (!Array.isArray(summaryArray) || summaryArray.length === 0) {
        throw new Error("Failed to generate summary: no data returned");
      }
      console.log("LLM analysis completed:", summaryArray);

      // ─── 4) SAVE TO SUPABASE ──────────────────────────────────────────
      setCurrentStep("saving");
      const aiTag = summarizeJson.suggestedTag || "";
      setSuggestedTag(aiTag);
      setCustomTag(aiTag);

      const summaryContent = summaryArray.join("\n");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Not authenticated", { cause: sessionError?.message });
      }

      const userId = session.user.id;

      // Use the notes API instead of direct Supabase call to ensure free_notes_count gets updated
      const noteRes = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Idea from ${new Date().toLocaleString()}`,
          content: transcription,
          summary: summaryContent,
          tag: aiTag,
          source: "dashboard_upload",
          user_id: userId,
        }),
      });

      if (!noteRes.ok) {
        const noteResData = await noteRes.json();
        throw new Error(noteResData.error || "Failed to save note", {
          cause: noteResData.code || "SAVE_ERROR",
        });
      }

      console.log("Data saved via API, note count should be updated");

      setSummary(summaryArray);

      // After saving the note, refresh the profile data to show updated counts
      await refreshProfileData();

      // ─── 5) RESET UI ─────────────────────────────────────────────────
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      setAudioBlob(null);
      if (audioURL) URL.revokeObjectURL(audioURL);
      setCurrentStep("idle");
    } catch (err: unknown) {
      console.error("Process error:", err);
      const e = err as Error & { cause?: string };
      setError(e.message);
      setErrorDetails(e.cause ?? null);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setCurrentStep("idle");
    }
  }

  // Function to regenerate tag
  const regenerateTag = async () => {
    if (summary.length === 0) return;

    setIsProcessing(true);
    try {
      const fullSummary = summary.join(" ");
      const response = await fetch("/api/generate-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: fullSummary }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate tag");
      }

      setSuggestedTag(data.tag);
      setCustomTag(data.tag);
    } catch (error) {
      console.error("Error regenerating tag:", error);
      setError("Failed to regenerate tag");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to update tag in database
  const updateTagInDatabase = async () => {
    if (!customTag.trim()) return;

    try {
      // Get the last idea (this is a simplification, ideally we'd have the note ID)
      const { data: latestNotes } = await supabase
        .from("notes")
        .select()
        .order("created_at", { ascending: false })
        .limit(1);

      if (!latestNotes || latestNotes.length === 0) {
        throw new Error("No notes found to update");
      }

      const noteId = latestNotes[0].id;

      // Update the tag
      const { error: updateError } = await supabase
        .from("notes")
        .update({ tag: customTag.trim() })
        .eq("id", noteId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update was successful
      setSuggestedTag(customTag.trim());
      setIsEditingTag(false);
    } catch (error) {
      console.error("Error updating tag:", error);
      setError("Failed to update tag in database");
    }
  };

  // Tag emoji mapping function
  const getTagEmoji = (tag: string): string => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes("idea") || lowerTag.includes("concept")) return "💡";
    if (lowerTag.includes("tool") || lowerTag.includes("product")) return "🧰";
    if (lowerTag.includes("growth") || lowerTag.includes("market")) return "📈";
    if (lowerTag.includes("content") || lowerTag.includes("video")) return "📹";
    if (lowerTag.includes("design") || lowerTag.includes("ui")) return "🎨";
    if (lowerTag.includes("code") || lowerTag.includes("dev")) return "💻";
    if (lowerTag.includes("meeting") || lowerTag.includes("call")) return "📞";
    return "🏷️"; // Default tag emoji
  };

  // Add function to refresh profile data
  const refreshProfileData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const response = await fetch(`/api/notes?user_id=${user.id}`);
        const responseData = await response.json();
        if (responseData?.userProfile) {
          setUserProfile({
            subscription_status: responseData.userProfile.subscription_status,
            free_notes_count: responseData.userProfile.free_notes_count,
            isAdmin: responseData.userProfile.role === "admin",
          });
          console.log("User profile refreshed:", responseData.userProfile);
        }
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d]">
        {/* Simple loading spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#facc15]"></div>
        <p className="mt-4 text-lg text-white">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#121212] text-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/5">
          <div className="p-8 md:p-10">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#f97316] mb-8 text-center">
              Audio to Insights
            </h1>

            {/* Add Profile Debug Info */}
            <div className="mb-6 p-3 bg-black/30 rounded-lg border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-white/70 text-sm">Status: </span>
                <span
                  className={`text-sm font-medium ${userProfile.subscription_status === "active" ? "text-green-400" : "text-white"}`}
                >
                  {userProfile.subscription_status || "loading..."}
                </span>
                {userProfile.isAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-[#facc15]/20 text-[#facc15] text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-white/70 text-sm mr-2">Notes used: </span>
                <span className="text-sm font-medium text-white">
                  {userProfile.free_notes_count ?? "..."}/{FREE_NOTES_LIMIT}
                </span>
                <button
                  onClick={refreshProfileData}
                  className="ml-3 p-1 text-[#facc15] hover:text-[#fde047] rounded-full"
                  title="Refresh profile data"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-900/30 text-red-300 rounded-lg border border-red-700/50 shadow-sm">
                <p className="font-medium">Error: {error}</p>
                {errorDetails && (
                  <p className="mt-1 text-sm">Details: {errorDetails}</p>
                )}
                {currentStep !== "idle" && (
                  <p className="mt-2 text-xs">
                    (Occurred during: {currentStep})
                  </p>
                )}
              </div>
            )}

            <div className="mb-10">
              <div className="grid md:grid-cols-2 gap-6">
                {/* File Upload Panel */}
                <div className="bg-black/50 p-6 rounded-xl border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#facc15]/5 hover:border-[#facc15]/20">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-[#facc15]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload Audio/Video
                  </h3>

                  <div
                    className={`group flex justify-center items-center px-4 py-10 border-2 ${
                      file && !audioBlob
                        ? "border-[#facc15]"
                        : "border-white/10"
                    } border-dashed rounded-xl transition-all hover:border-[#facc15]/50 cursor-pointer bg-black/20 hover:bg-black/30`}
                    onClick={() =>
                      !isUploading &&
                      !isProcessing &&
                      !isRecording &&
                      fileInputRef.current?.click()
                    }
                  >
                    <div className="space-y-2 text-center">
                      {file && !audioBlob ? (
                        <>
                          <div className="text-[#facc15] mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-[#facc15]/10 group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex text-sm justify-center mt-2">
                            <span className="relative bg-[#facc15] text-black font-medium rounded-md hover:bg-[#fde047] px-3 py-1.5 transition-colors duration-200 shadow-lg shadow-[#facc15]/20">
                              Change file
                            </span>
                          </div>
                          <p className="text-white font-medium text-sm mt-2">
                            {file.name}
                          </p>
                          <p className="text-xs text-white/70">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="mx-auto h-16 w-16 text-white/50 group-hover:text-[#facc15] transition-all duration-300 group-hover:scale-110">
                            <svg
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="flex text-sm justify-center mt-2">
                            <span className="relative bg-white/10 backdrop-blur-sm rounded-md font-medium text-[#facc15] hover:text-[#fde047] hover:bg-white/20 px-3 py-1.5 transition-all duration-200">
                              Upload a file
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-2">
                            MP3, MP4, WAV, OGG, WebM, MOV
                          </p>
                        </>
                      )}
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,video/mp4,video/webm,video/ogg,video/quicktime"
                        disabled={isUploading || isProcessing || isRecording}
                      />
                    </div>
                  </div>
                </div>

                {/* Audio Recording Panel */}
                <div className="bg-black/50 p-6 rounded-xl border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#facc15]/5 hover:border-[#facc15]/20">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-[#facc15]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    Record Audio
                  </h3>

                  {/* Add help text for microphone access */}
                  <p className="text-xs text-white/70 mb-4">
                    You&apos;ll need to grant microphone permissions to record
                    audio. If you experience issues, check your browser
                    settings.
                  </p>

                  <div className="flex flex-col items-center justify-center py-6 px-4 bg-black/20 rounded-xl border border-white/5">
                    {/* Recording interface */}
                    <div className="relative w-full">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {!isRecording ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            disabled={isUploading || isProcessing}
                            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                              isUploading || isProcessing
                                ? "bg-[#facc15]/30 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#facc15] to-[#f97316] hover:from-[#fde047] hover:to-[#f97316] hover:scale-105 shadow-lg hover:shadow-[#facc15]/30"
                            }`}
                          >
                            <span className="sr-only">Start recording</span>
                            <svg
                              className="w-8 h-8 text-black"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <circle cx="10" cy="10" r="6" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-[#facc15]/20 rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg"
                          >
                            <span className="sr-only">Stop recording</span>
                            <svg
                              className="w-7 h-7 text-[#facc15]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <rect width="10" height="10" x="5" y="5" />
                            </svg>
                          </button>
                        )}

                        <div className="text-center">
                          {isRecording ? (
                            <div className="flex items-center">
                              <div className="animate-pulse mr-2 h-3 w-3 rounded-full bg-[#facc15]"></div>
                              <span className="text-md font-medium text-white">
                                Recording: {formatTime(recordingTime)}
                              </span>
                            </div>
                          ) : audioURL ? (
                            <span className="text-md font-medium text-white">
                              Recording ready: {formatTime(recordingTime)}
                            </span>
                          ) : (
                            <span className="text-md text-white/70">
                              Click to start recording
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Audio player */}
                      {audioURL && (
                        <div className="mt-5 flex justify-center p-3 bg-black/40 rounded-lg backdrop-blur-sm">
                          <audio
                            src={audioURL}
                            controls
                            className="w-full h-10 max-w-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <button
                type="submit"
                disabled={
                  (!file && !audioBlob) ||
                  isUploading ||
                  isProcessing ||
                  isRecording
                }
                className={`w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-lg text-md font-medium transition-all duration-300 ${
                  (!file && !audioBlob) ||
                  isUploading ||
                  isProcessing ||
                  isRecording
                    ? "bg-white/5 text-white/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#facc15] to-[#f97316] hover:from-[#fde047] hover:to-[#f97316] text-black hover:shadow-xl hover:shadow-[#facc15]/20 hover:translate-y-[-2px]"
                }`}
              >
                {isUploading || isProcessing ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {currentStep === "uploading"
                      ? "Uploading your thoughts..."
                      : currentStep === "transcribing"
                        ? "Transcribing audio..."
                        : currentStep === "analyzing"
                          ? "Extracting insights..."
                          : "Saving your brilliance..."}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Transform Thoughts to Insights
                  </span>
                )}
              </button>

              {isProcessing && (
                <div className="relative mt-8 mb-2">
                  <div className="flex justify-center items-center space-x-2 mb-3">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#facc15]"></div>
                    <p className="text-sm font-medium text-white animate-pulse">
                      {currentStep === "transcribing"
                        ? "Converting speech to text..."
                        : currentStep === "analyzing"
                          ? "AI brain extracting key insights..."
                          : currentStep === "saving"
                            ? "Saving to your collection..."
                            : "Processing..."}
                    </p>
                  </div>

                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#facc15] to-[#f97316] h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width:
                          currentStep === "uploading"
                            ? "25%"
                            : currentStep === "transcribing"
                              ? "50%"
                              : currentStep === "analyzing"
                                ? "75%"
                                : currentStep === "saving"
                                  ? "90%"
                                  : "10%",
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </form>

            {summary.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#f97316] flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-[#facc15]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Key Insights
                  </h2>

                  {/* Tag UI */}
                  <div className="mt-4 md:mt-0 flex items-center">
                    <span className="text-white/70 text-sm mr-2">Tag:</span>
                    {isEditingTag ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          className="bg-black/50 border border-white/10 text-white px-3 py-1.5 rounded-md text-sm w-40 focus:border-[#facc15]/50 focus:outline-none focus:ring-1 focus:ring-[#facc15]/30"
                          maxLength={20}
                        />
                        <button
                          onClick={updateTagInDatabase}
                          className="bg-[#facc15] hover:bg-[#fde047] text-black px-3 py-1.5 rounded-md text-sm transition-colors duration-200 font-medium"
                          disabled={isProcessing}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setCustomTag(suggestedTag);
                            setIsEditingTag(false);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-sm transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="bg-black/40 backdrop-blur-sm border border-white/10 text-white px-3 py-1.5 rounded-full text-sm flex items-center shadow-inner">
                          <span className="mr-1 text-lg">
                            {getTagEmoji(suggestedTag)}
                          </span>
                          <span className="font-medium">
                            {suggestedTag || "Untagged"}
                          </span>
                        </div>
                        <button
                          onClick={() => setIsEditingTag(true)}
                          className="text-[#facc15] hover:text-[#fde047] text-sm transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={regenerateTag}
                          className="text-[#facc15] hover:text-[#fde047] text-sm transition-colors"
                          disabled={isProcessing}
                        >
                          <svg
                            className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl shadow-inner border border-white/10">
                  <ul className="space-y-4">
                    {summary.map((point, index) => (
                      <li
                        key={index}
                        className="pb-4 border-b border-white/5 last:border-0 flex items-start"
                      >
                        <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#facc15] to-[#f97316] h-6 w-6 rounded-full text-black text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-white/90">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 sm:mb-0 px-4 py-2 bg-[#facc15]/10 rounded-full">
                    <svg
                      className="w-5 h-5 mr-2 text-[#facc15]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-white">
                      Insights saved to your collection
                    </p>
                  </div>
                  <Link
                    href="/dashboard/notes"
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:translate-y-[-2px] flex items-center group"
                  >
                    <span>View all insights</span>
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer attribution */}
        <div className="mt-10 text-center text-white/30 text-xs">
          <p>Built for makers and indie hackers who think out loud.</p>
        </div>
      </main>
    </div>
  );
}
