"use client";

import { useState, useCallback } from "react";
import type { Post, CreatePostData, UpdatePostData } from "@/types/post";

interface MutationState {
  loading: boolean;
  error: string | null;
}

export function useMutatePost() {
  const [createState, setCreateState] = useState<MutationState>({
    loading: false,
    error: null,
  });

  const [updateState, setUpdateState] = useState<MutationState>({
    loading: false,
    error: null,
  });

  const [deleteState, setDeleteState] = useState<MutationState>({
    loading: false,
    error: null,
  });

  const createPost = useCallback(
    async (data: CreatePostData): Promise<Post | null> => {
      try {
        setCreateState({ loading: true, error: null });

        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create post");
        }

        const post: Post = await response.json();
        setCreateState({ loading: false, error: null });
        return post;
      } catch (error) {
        console.error("Error creating post:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setCreateState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  const updatePost = useCallback(
    async (postId: string, data: UpdatePostData): Promise<Post | null> => {
      try {
        setUpdateState({ loading: true, error: null });

        const response = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update post");
        }

        const post: Post = await response.json();
        setUpdateState({ loading: false, error: null });
        return post;
      } catch (error) {
        console.error("Error updating post:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setUpdateState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      setDeleteState({ loading: true, error: null });

      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      setDeleteState({ loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setDeleteState({ loading: false, error: errorMessage });
      return false;
    }
  }, []);

  return {
    createPost,
    updatePost,
    deletePost,
    createState,
    updateState,
    deleteState,
  };
}
