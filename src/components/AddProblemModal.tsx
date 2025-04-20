"use client";

import { useEffect, useRef, useState } from "react";
import { Problem } from "@/components/ProblemsList";

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problem: Problem) => void;
  remainingSubmissions: number;
}

export default function AddProblemModal({
  isOpen,
  onClose,
  onSubmit,
  remainingSubmissions,
}: AddProblemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      titleInputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleShare = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags: [],
        }),
      });

      if (!res.ok) throw new Error("Failed to share problem");

      const result = await res.json();
      onSubmit(result);
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] rounded-2xl shadow-lg p-6 w-full max-w-md z-10">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Share a Problem</h2>
        <p className="text-white/70 mb-4 text-sm">
          Come share your thoughts — I always wanted a spot to just dump my
          problems, so I built one.
          {remainingSubmissions > 0 ? (
            <span className="ml-1 text-yellow-500">
              You have {remainingSubmissions} submission
              {remainingSubmissions !== 1 ? "s" : ""} remaining.
            </span>
          ) : (
            <span className="ml-1 text-red-500">
              You&apos;ve reached your submission limit for this session.
            </span>
          )}
        </p>

        <div className="mb-4">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Problem title"
            maxLength={100}
            className="w-full bg-[#262626] border border-[#373737] rounded-xl p-3 text-white focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] focus:outline-none"
            disabled={isSubmitting}
          />
          <div className="text-right text-xs text-white/50 mt-1">
            {title.length}/100
          </div>
        </div>

        <div className="mb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your problem or idea..."
            maxLength={300}
            rows={4}
            className="w-full bg-[#262626] border border-[#373737] rounded-xl p-3 text-white focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] focus:outline-none resize-none"
            disabled={isSubmitting}
          />
          <div className="text-right text-xs text-white/50 mt-1">
            {description.length}/300
          </div>
        </div>

        <button
          onClick={handleShare}
          disabled={
            isSubmitting ||
            !title.trim() ||
            !description.trim() ||
            remainingSubmissions <= 0
          }
          className={`mt-2 w-full py-3 rounded-xl text-black font-medium transition-colors ${
            isSubmitting ||
            !title.trim() ||
            !description.trim() ||
            remainingSubmissions <= 0
              ? "bg-white/10 cursor-not-allowed"
              : "bg-gradient-to-r from-[#facc15] to-[#f97316] hover:from-[#fde047]"
          }`}
        >
          {isSubmitting
            ? "Sharing..."
            : remainingSubmissions <= 0
              ? "Limit Reached"
              : "Share"}
        </button>
      </div>
    </div>
  );
}
