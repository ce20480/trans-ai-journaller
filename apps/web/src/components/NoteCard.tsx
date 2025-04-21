"use client";

import { useState } from "react";
import { format } from "date-fns";

export interface NoteProps {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tag?: string;
  created_at: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function NoteCard({
  id,
  title,
  content,
  summary,
  tag,
  created_at,
  onEdit,
  onDelete,
}: NoteProps) {
  const [expanded, setExpanded] = useState(false);

  // If no AI summary, fall back to first 150 chars of content
  const displayText = summary?.trim() || content.slice(0, 150) + "…";

  // Only show the “show more” toggle if there’s hidden text
  const needsToggle =
    (summary ? summary.length : content.length) > displayText.length;

  const formatted = format(new Date(created_at), "MMM d, yyyy");

  // simple tag→emoji
  const emoji = tag
    ? (() => {
        const t = tag.toLowerCase();
        if (t.includes("idea")) return "💡";
        if (t.includes("growth")) return "📈";
        if (t.includes("tool")) return "🧰";
        if (t.includes("code")) return "💻";
        return "🏷️";
      })()
    : null;

  return (
    <div className="bg-[#262626] rounded-lg border border-[#373737] hover:shadow-lg transition">
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
          {tag && (
            <span className="text-xs bg-[#1a1a1a] text-white px-2 py-0.5 rounded-full flex items-center space-x-1">
              <span>{emoji}</span>
              <span>{tag}</span>
            </span>
          )}
        </div>

        <div className="text-[#b3b3b3] text-xs mb-2">{formatted}</div>

        <div className="flex-1">
          <p
            className={`text-sm text-[#e0e0e0] ${
              !expanded ? "line-clamp-4" : ""
            }`}
          >
            {expanded ? summary || content : displayText}
          </p>
          {needsToggle && (
            <button
              onClick={() => setExpanded((x) => !x)}
              className="text-xs text-[#facc15] mt-1 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="text-xs bg-[#373737] hover:bg-[#4a4a4a] text-white px-3 py-1 rounded"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="text-xs bg-[#373737] hover:bg-red-900/50 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
