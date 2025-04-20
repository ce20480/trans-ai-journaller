"use client";

import { useState, FormEvent } from "react";

interface ProblemFormProps {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onSuccess?: () => void;
}

export default function ProblemForm({
  isSubmitting,
  setIsSubmitting,
  onSuccess,
}: ProblemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate form
      if (!title.trim()) {
        throw new Error("Please enter a title");
      }

      if (!description.trim()) {
        throw new Error("Please enter a description");
      }

      // Submit to API
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags.trim() ? tags : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit problem");
      }

      // Success - reset form
      setTitle("");
      setDescription("");
      setTags("");
      setSuccess(true);
      setShowAdvanced(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error submitting problem:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-green-900/30 text-green-300 rounded-xl border border-green-700/50 text-center">
        <h3 className="text-xl font-bold mb-2">Thank you!</h3>
        <p>Your problem has been submitted successfully!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/30 text-red-300 rounded-lg border border-red-700/50">
          {error}
        </div>
      )}

      <div>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="I need a tool that..."
          maxLength={100}
          className="w-full bg-[#262626] border border-[#373737] rounded-xl px-4 py-3 text-white focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] focus:outline-none text-lg"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your problem or idea (e.g. tracks my screen time automatically) → Why it matters to you"
          rows={3}
          maxLength={300}
          className="w-full bg-[#262626] border border-[#373737] rounded-xl px-4 py-3 text-white focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] focus:outline-none"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-white/60 hover:text-[#facc15] mb-2 flex items-center"
        >
          <span>{showAdvanced ? "Hide" : "Show"} Advanced Options</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`ml-1 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-2 p-4 bg-[#1a1a1a] rounded-lg border border-[#373737]">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-white mb-1"
            >
              Tags (optional)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., webapp, design, marketing)"
              className="w-full bg-[#262626] border border-[#373737] rounded px-4 py-2 text-white focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] focus:outline-none"
              disabled={isSubmitting}
            />
            <div className="text-xs text-white/50 mt-1">
              Separate tags with commas
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <div className="text-xs text-white/60 text-center mb-2">
          Posting today? You&apos;ll be entered to win a free tool license every
          Friday!
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-lg text-md font-medium transition-all duration-300 ${
            isSubmitting
              ? "bg-white/5 text-white/50 cursor-not-allowed"
              : "bg-gradient-to-r from-[#facc15] to-[#f97316] hover:from-[#fde047] hover:to-[#f97316] text-black hover:shadow-xl hover:shadow-[#facc15]/20 hover:translate-y-[-2px]"
          }`}
        >
          {isSubmitting ? (
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
              Submitting...
            </span>
          ) : (
            "Share Problem →"
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-[#1a1a1a]/50 rounded-lg border border-[#373737] text-center">
        <p className="text-white/70 text-sm">
          <span className="text-[#facc15]">🔔</span> Sign up to get notified
          when someone solves your problem (no spam, promise!)
        </p>
      </div>
    </form>
  );
}
