"use client";

import { useState } from "react";
import type { Post } from "@/types/post";
import { useLike } from "@/hooks/use-like";
import { useMutatePost } from "@/hooks/use-mutate-post";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onUpdate: (postId: string, updates: Partial<Post>) => void;
  onDelete: (postId: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onUpdate,
  onDelete,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { toggleLike } = useLike();
  const { updatePost, deletePost, updateState, deleteState } = useMutatePost();

  const isOwner = currentUserId === post.author_id;
  const likesCount = post._count?.likes || 0;

  const handleLike = async () => {
    await toggleLike(
      post.id,
      post.isLiked || false,
      (postId, isLiked, likesCountDelta) => {
        onUpdate(postId, {
          isLiked,
          _count: {
            likes: Math.max(0, likesCount + likesCountDelta),
          },
        });
      }
    );
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === post.content) {
      setIsEditing(false);
      setEditContent(post.content);
      return;
    }

    const updatedPost = await updatePost(post.id, {
      content: editContent.trim(),
    });
    if (updatedPost) {
      onUpdate(post.id, updatedPost);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const success = await deletePost(post.id);
      if (success) {
        onDelete(post.id);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(post.content);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {post.profiles.username[0].toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-gray-900">
              @{post.profiles.username}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              {formatDate(post.created_at)}
              {post.updated_at !== post.created_at && (
                <span className="text-xs text-gray-400 ml-1">(edited)</span>
              )}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-blue-600 text-sm"
              disabled={updateState.loading}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-600 text-sm"
              disabled={deleteState.loading}
            >
              {deleteState.loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={280}
              autoFocus
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {280 - editContent.length} characters remaining
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  disabled={updateState.loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={
                    updateState.loading ||
                    !editContent.trim() ||
                    editContent === post.content
                  }
                >
                  {updateState.loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            {updateState.error && (
              <p className="text-red-600 text-sm mt-1">{updateState.error}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 text-sm ${
            post.isLiked
              ? "text-red-500 hover:text-red-600"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          <span className="text-lg">{post.isLiked ? "❤️" : "🤍"}</span>
          <span>{likesCount}</span>
        </button>

        <div className="text-xs text-gray-400">
          Post ID: {post.id.slice(-8)}
        </div>
      </div>
    </div>
  );
}
