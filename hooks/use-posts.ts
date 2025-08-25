"use client";

import { useState, useCallback, useEffect } from "react";
import type { Post, PostsResponse, FilterType } from "@/types/post";

interface UsePostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
}

interface UsePostsParams {
  initialQuery?: string;
  initialFilter?: FilterType;
}

export function usePosts({
  initialQuery = "",
  initialFilter = "all",
}: UsePostsParams = {}) {
  const [state, setState] = useState<UsePostsState>({
    posts: [],
    loading: false,
    error: null,
    hasMore: true,
  });

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterType>(initialFilter);

  const fetchPosts = useCallback(
    async (
      searchQuery: string = query,
      filterType: FilterType = filter,
      cursor?: string,
      replace = false
    ) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const params = new URLSearchParams();
        if (searchQuery) params.set("query", searchQuery);
        if (cursor) params.set("cursor", cursor);
        if (filterType) params.set("filter", filterType);

        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch posts");
        }

        const data: PostsResponse = await response.json();

        setState((prev) => ({
          ...prev,
          posts: replace ? data.posts : [...prev.posts, ...data.posts],
          hasMore: data.hasMore,
          nextCursor: data.nextCursor,
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    },
    [query, filter]
  );

  // Load initial posts
  useEffect(() => {
    fetchPosts(query, filter, undefined, true);
  }, [query, filter]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore && state.nextCursor) {
      fetchPosts(query, filter, state.nextCursor, false);
    }
  }, [
    fetchPosts,
    query,
    filter,
    state.loading,
    state.hasMore,
    state.nextCursor,
  ]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const changeFilter = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  const refresh = useCallback(() => {
    fetchPosts(query, filter, undefined, true);
  }, [fetchPosts, query, filter]);

  // Optimistic updates
  const addOptimisticPost = useCallback((post: Post) => {
    setState((prev) => ({
      ...prev,
      posts: [post, ...prev.posts],
    }));
  }, []);

  const updateOptimisticPost = useCallback(
    (postId: string, updates: Partial<Post>) => {
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((post) =>
          post.id === postId ? { ...post, ...updates } : post
        ),
      }));
    },
    []
  );

  const removeOptimisticPost = useCallback((postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post.id !== postId),
    }));
  }, []);

  return {
    ...state,
    query,
    filter,
    search,
    changeFilter,
    loadMore,
    refresh,
    addOptimisticPost,
    updateOptimisticPost,
    removeOptimisticPost,
  };
}
