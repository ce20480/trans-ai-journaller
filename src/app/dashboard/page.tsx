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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
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
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            TransAIJournaller
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
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Media Transcription Dashboard
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              <p className="font-medium">{error}</p>
              {errorDetails && <p className="mt-1 text-sm">{errorDetails}</p>}
              {currentStep !== "idle" && (
                <p className="mt-2 text-sm">
                  Error occurred during the{" "}
                  <span className="font-medium">{currentStep}</span> step.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Audio/Video File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col rounded-lg border-4 border-dashed w-full h-auto p-8 group text-center">
                  <div className="h-full w-full text-center flex flex-col items-center justify-center">
                    {file ? (
                      <div className="mb-3">
                        <p className="text-blue-600 font-medium">{file.name}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB |{" "}
                          {file.type}
                        </p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-10 h-10 text-blue-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                        <p className="text-gray-700 font-medium mb-2">
                          Drag and drop or click to select
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,video/mp4,video/webm,video/ogg,video/quicktime"
                    disabled={isUploading || isProcessing}
                  />
                </label>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <p className="font-medium mb-1">Supported file formats:</p>
                <p>
                  <span className="font-medium">Audio:</span> MP3, MP4, WAV,
                  OGG, WebM
                </p>
                <p>
                  <span className="font-medium">Video:</span> MP4, WebM, OGG,
                  QuickTime (MOV)
                </p>
                <p className="mt-1">
                  <span className="font-medium">Maximum file size:</span> 100MB
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || isUploading || isProcessing}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                !file || isUploading || isProcessing
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              {isUploading
                ? "Uploading..."
                : isProcessing
                ? "Processing..."
                : "Upload and Process"}
            </button>

            {isProcessing && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600">
                  This may take a few minutes depending on the file size...
                </p>
              </div>
            )}
          </form>

          {summary.length > 0 && (
            <div className="mt-10 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Summary Points</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="list-disc pl-5 space-y-2">
                  {summary.map((point, index) => (
                    <li key={index} className="text-gray-800">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  These summary points have been saved to your Google Sheet.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
