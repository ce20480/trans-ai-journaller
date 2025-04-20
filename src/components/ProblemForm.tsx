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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/30 text-red-300 rounded-lg border border-red-700/50">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/30 text-green-300 rounded-lg border border-green-700/50">
          Your problem has been submitted successfully!
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-white mb-1"
        >
          Problem Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your problem or idea?"
          maxLength={100}
          className="w-full bg-[#262626] border border-[#373737] rounded px-4 py-2 text-white focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] focus:outline-none"
          disabled={isSubmitting}
        />
        <div className="text-right text-xs text-white/50 mt-1">
          {title.length}/100
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-white mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your problem or idea in detail..."
          rows={5}
          maxLength={1000}
          className="w-full bg-[#262626] border border-[#373737] rounded px-4 py-2 text-white focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] focus:outline-none"
          disabled={isSubmitting}
        />
        <div className="text-right text-xs text-white/50 mt-1">
          {description.length}/1000
        </div>
      </div>

      <div>
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

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center items-center py-3 px-6 rounded-xl shadow-lg text-md font-medium transition-all duration-300 ${
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
            "Post Your Problem"
          )}
        </button>
      </div>
    </form>
  );
}
