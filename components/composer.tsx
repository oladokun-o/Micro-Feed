"use client";

import { useState } from "react";
import { useMutatePost } from "@/hooks/use-mutate-post";
import type { Post } from "@/types/post";

interface ComposerProps {
  onPostCreated: (post: Post) => void;
}

export function Composer({ onPostCreated }: ComposerProps) {
  const [content, setContent] = useState("");
  const { createPost, createState } = useMutatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const post = await createPost({ content: content.trim() });
    if (post) {
      onPostCreated(post);
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isSubmitDisabled =
    !content.trim() || content.length > 280 || createState.loading;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's happening?"
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={280}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span
              className={`text-sm ${
                content.length > 280
                  ? "text-red-500"
                  : content.length > 250
                  ? "text-yellow-500"
                  : "text-gray-500"
              }`}
            >
              {content.length}/280
            </span>
            {content.length > 0 && (
              <span className="text-xs text-gray-400">
                Cmd/Ctrl + Enter to post
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {createState.loading ? "Posting..." : "Post"}
          </button>
        </div>

        {createState.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {createState.error}
          </div>
        )}
      </form>
    </div>
  );
}
