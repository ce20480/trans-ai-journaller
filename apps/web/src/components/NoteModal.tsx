"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Note } from "./NotesList";

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onSave?: (updatedNote: Partial<Note>) => Promise<void>;
}

export default function NoteModal({
  isOpen,
  note,
  onClose,
  onSave,
}: NoteModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTag(note.tag || "");
      setError(null);
    }
    // Exit edit mode when note changes
    setIsEditing(false);
  }, [note]);

  const handleClose = useCallback(() => {
    if (isSaving) return;

    // Prompt if there are unsaved changes in edit mode
    if (
      isEditing &&
      (title !== note?.title ||
        content !== note?.content ||
        tag !== (note?.tag || ""))
    ) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isEditing, isSaving, note, title, content, tag, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, handleClose]);

  const handleSave = async () => {
    if (!note || !onSave) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        id: note.id,
        title,
        content,
        tag: tag || null,
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save note:", err);
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !note) return null;

  // Get tag emoji
  const getTagEmoji = (tagText: string): string => {
    const lowerTag = tagText.toLowerCase();
    if (lowerTag.includes("idea") || lowerTag.includes("concept")) return "💡";
    if (lowerTag.includes("tool") || lowerTag.includes("product")) return "🧰";
    if (lowerTag.includes("growth") || lowerTag.includes("market")) return "📈";
    if (lowerTag.includes("content") || lowerTag.includes("video")) return "📹";
    if (lowerTag.includes("design") || lowerTag.includes("ui")) return "🎨";
    if (lowerTag.includes("code") || lowerTag.includes("dev")) return "💻";
    if (lowerTag.includes("meeting") || lowerTag.includes("call")) return "📞";
    return "🏷️"; // Default tag emoji
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-[#1a1a1a] rounded-xl border border-[#373737] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#373737]">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#262626] border border-[#373737] px-3 py-2 rounded text-white text-lg font-medium w-full"
              placeholder="Note title"
            />
          ) : (
            <h2 className="text-xl font-bold text-white">{note.title}</h2>
          )}

          <div className="flex space-x-2 ml-4">
            {!isEditing && onSave && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-[#facc15] hover:bg-[#262626] rounded-full"
                title="Edit note"
              >
                <svg
                  className="w-5 h-5"
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
            )}
            <button
              onClick={handleClose}
              className="p-2 text-white hover:bg-[#262626] rounded-full"
              title="Close"
            >
              <svg
                className="w-5 h-5"
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 text-red-300 rounded-lg border border-red-700/50">
              {error}
            </div>
          )}

          {/* Tag */}
          <div className="mb-6">
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="bg-[#262626] border border-[#373737] px-3 py-2 rounded text-white w-full"
                  placeholder="Add a tag (optional)"
                />
              </div>
            ) : note.tag ? (
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 bg-[#262626] text-white rounded-full text-sm">
                  <span className="mr-1">{getTagEmoji(note.tag)}</span>
                  {note.tag}
                </span>
              </div>
            ) : null}
          </div>

          {/* Main content */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-[#262626] border border-[#373737] px-3 py-2 rounded text-white w-full min-h-[300px]"
                placeholder="Note content"
              />
            </div>
          ) : (
            <>
              {note.summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[#facc15] mb-2">
                    Summary
                  </h3>
                  <div className="bg-[#262626] border border-[#373737] p-4 rounded-lg text-white">
                    {note.summary.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-[#facc15] mb-2">
                  Content
                </h3>
                <div className="bg-[#262626] border border-[#373737] p-4 rounded-lg text-white whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="p-4 border-t border-[#373737] flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-[#262626] text-white rounded-lg hover:bg-[#373737]"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-[#facc15] to-[#f97316] text-black rounded-lg font-medium flex items-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}

        {/* Created date */}
        <div className="p-2 border-t border-[#373737] text-[#b3b3b3] text-xs text-center">
          Created {new Date(note.created_at).toLocaleDateString()} at{" "}
          {new Date(note.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
