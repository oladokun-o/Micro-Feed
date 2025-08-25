"use client";

import { useState, useCallback } from "react";

interface UseLikeState {
  loading: boolean;
  error: string | null;
}

export function useLike() {
  const [state, setState] = useState<UseLikeState>({
    loading: false,
    error: null,
  });

  const toggleLike = useCallback(
    async (
      postId: string,
      isCurrentlyLiked: boolean,
      optimisticUpdate: (
        postId: string,
        isLiked: boolean,
        likesCount: number
      ) => void
    ): Promise<boolean> => {
      const newLikedState = !isCurrentlyLiked;
      const likesCountDelta = newLikedState ? 1 : -1;

      try {
        setState({ loading: true, error: null });

        // Apply optimistic update immediately
        optimisticUpdate(postId, newLikedState, likesCountDelta);

        const url = `/api/posts/${postId}/like`;
        const method = newLikedState ? "POST" : "DELETE";

        const response = await fetch(url, { method });

        if (!response.ok) {
          // Revert optimistic update on failure
          optimisticUpdate(postId, isCurrentlyLiked, -likesCountDelta);

          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to toggle like");
        }

        setState({ loading: false, error: null });
        return true;
      } catch (error) {
        console.error("Error toggling like:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState({ loading: false, error: errorMessage });

        // Make sure optimistic update is reverted
        optimisticUpdate(postId, isCurrentlyLiked, -likesCountDelta);
        return false;
      }
    },
    []
  );

  return {
    toggleLike,
    loading: state.loading,
    error: state.error,
  };
}
