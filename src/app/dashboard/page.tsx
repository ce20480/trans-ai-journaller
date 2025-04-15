"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
        const response = await fetch("/api/auth/check", {
          method: "GET",
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (err: unknown) {
        console.error("Authentication check failed:", err);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

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
      setError("Could not access microphone");
      setErrorDetails(err instanceof Error ? err.message : "Unknown error");
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
      // Step 1: Upload file
      console.log("Starting file upload");
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        const errorMsg = uploadData.error || "Upload failed";
        const details = uploadData.details || uploadData.supportedTypes || "";
        console.error("Upload error:", { errorMsg, details });
        throw new Error(errorMsg, { cause: details });
      }

      console.log("File uploaded successfully", uploadData);

      // Step 2: Transcribe file
      setCurrentStep("transcribing");
      setIsProcessing(true);
      console.log("Starting transcription");
      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: uploadData.filePath }),
      });

      const transcribeData = await transcribeResponse.json();

      if (!transcribeResponse.ok) {
        const errorMsg = transcribeData.error || "Transcription failed";
        const details = transcribeData.details || "";
        console.error("Transcription error:", { errorMsg, details });
        throw new Error(errorMsg, { cause: details });
      }

      console.log("Transcription completed");

      // Step 3: Process with LLM
      setCurrentStep("analyzing");
      console.log("Starting LLM analysis");
      const summarizeResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: transcribeData.transcription }),
      });

      const summarizeData = await summarizeResponse.json();

      if (!summarizeResponse.ok) {
        const errorMsg = summarizeData.error || "Summarization failed";
        const details = summarizeData.details || "";
        console.error("Summarization error:", { errorMsg, details });
        throw new Error(errorMsg, { cause: details });
      }

      if (
        !summarizeData.summary ||
        !Array.isArray(summarizeData.summary) ||
        summarizeData.summary.length === 0
      ) {
        console.error("Summarization returned empty or invalid data");
        throw new Error("Failed to generate summary: No data returned", {
          cause: "The LLM process returned empty results",
        });
      }

      console.log("LLM analysis completed");

      // Step 4: Write to Google Sheets
      setCurrentStep("saving");
      console.log("Saving to Google Sheets");
      const sheetsResponse = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summarizeData.summary }),
      });

      const sheetsData = await sheetsResponse.json();

      if (!sheetsResponse.ok) {
        const errorMsg = sheetsData.error || "Failed to save to Google Sheets";
        const details = sheetsData.details || "";
        console.error("Google Sheets error:", { errorMsg, details });
        throw new Error(errorMsg, { cause: details });
      }

      console.log("Data saved to Google Sheets");

      // Set results
      setSummary(summarizeData.summary);

      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
      setAudioBlob(null);
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      setCurrentStep("idle");
    } catch (err: unknown) {
      console.error("Process error:", err);
      if (err instanceof Error) {
        setError(err.message);

        // Handle error cause for detailed error information
        const errorWithCause = err as Error & { cause?: string };
        setErrorDetails(errorWithCause.cause || null);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setCurrentStep("idle");
    }
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-800 dark:to-gray-900">
        {/* Simple loading spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Replace with actual logo if available */}
            <svg
              className="w-8 h-8 text-primary dark:text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59L18 8h5v13H1V3h6zM1 14h6m-6 4h6m7-4h6"
              />
            </svg>
            <span className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
              TransAI Dashboard
            </span>
          </Link>
          <button
            onClick={async () => {
              try {
                // Call logout API endpoint
                await fetch("/api/auth/logout", {
                  method: "POST",
                });
                // Redirect to login page
                router.push("/login");
              } catch (error) {
                console.error("Logout failed:", error);
                // Fallback to client-side cookie clearing if API fails
                document.cookie =
                  "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                router.push("/login");
              }
            }}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 p-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Media Transcription & Analysis
            </h1>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700 shadow-sm">
                <p className="font-bold">Error: {error}</p>
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

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Choose Input Method
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* File Upload Panel */}
                <div className="bg-secondary dark:bg-gray-700 p-6 rounded-lg shadow-md">
                  <h3 className="text-md font-semibold mb-4 text-gray-800 dark:text-white">
                    Upload Audio/Video File
                  </h3>

                  <div className="flex justify-center px-4 pt-4 pb-4 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:border-primary dark:hover:border-primary transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500"
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
                      <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary dark:text-accent hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-2 py-1"
                        >
                          <span>
                            {file && !audioBlob
                              ? "Change file"
                              : "Upload a file"}
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,video/mp4,video/webm,video/ogg,video/quicktime"
                            disabled={
                              isUploading || isProcessing || isRecording
                            }
                          />
                        </label>
                      </div>
                      {file && !audioBlob ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Selected: {file.name} (
                          {(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          MP3, MP4, WAV, OGG, WebM, MOV
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audio Recording Panel */}
                <div className="bg-secondary dark:bg-gray-700 p-6 rounded-lg shadow-md">
                  <h3 className="text-md font-semibold mb-4 text-gray-800 dark:text-white">
                    Record Audio
                  </h3>

                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Recording interface */}
                    <div className="relative w-full">
                      <div className="flex items-center justify-center space-x-4 mb-2">
                        {!isRecording ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            disabled={isUploading || isProcessing}
                            className={`flex items-center justify-center w-12 h-12 rounded-full ${
                              isUploading || isProcessing
                                ? "bg-red-300 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            }`}
                          >
                            <span className="sr-only">Start recording</span>
                            <svg
                              className="w-6 h-6 text-white"
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
                            className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <span className="sr-only">Stop recording</span>
                            <svg
                              className="w-5 h-5 text-gray-700 dark:text-white"
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
                              <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Recording: {formatTime(recordingTime)}
                              </span>
                            </div>
                          ) : audioURL ? (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Recording complete: {formatTime(recordingTime)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Click to start recording
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Audio player */}
                      {audioURL && (
                        <div className="mt-3 flex justify-center">
                          <audio
                            src={audioURL}
                            controls
                            className="w-full h-8 max-w-xs"
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
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors duration-150 ${
                  (!file && !audioBlob) ||
                  isUploading ||
                  isProcessing ||
                  isRecording
                    ? "bg-teal-300 dark:bg-teal-800 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                }`}
              >
                {isUploading || isProcessing ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      ? "Uploading..."
                      : "Processing..."}
                  </span>
                ) : (
                  "Process & Generate Summary"
                )}
              </button>

              {isProcessing && (
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Processing step:{" "}
                    <span className="font-medium text-primary dark:text-accent">
                      {currentStep}
                    </span>
                    ...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    This might take a few moments.
                  </p>
                </div>
              )}
            </form>

            {summary.length > 0 && (
              <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Generated Summary
                </h2>
                <div className="bg-secondary dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-200">
                    {summary.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  <p>
                    ✅ Summary points saved to Google Sheet: &apos;Idea
                    Sheet&apos;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
