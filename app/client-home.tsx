"use client";

import { useEffect, useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/post-card";
import { Composer } from "@/components/composer";
import { Toolbar } from "@/components/toolbar";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/db";

interface ClientHomeProps {
  user: User | null;
  initialPosts: any;
}

export default function ClientHome({
  user: initialUser,
  initialPosts,
}: ClientHomeProps) {
  const [localPosts, setLocalPosts] = useState(initialPosts);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  const {
    posts,
    loading: postsLoading,
    error,
    hasMore,
    query,
    filter,
    search,
    changeFilter,
    loadMore,
    refresh,
    addOptimisticPost,
    updateOptimisticPost,
    removeOptimisticPost,
  } = usePosts();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
      }
    });
    if (error) console.error("Error signing in:", error);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
  };

  const handleLoadMore = () => {
    if (!postsLoading && hasMore) {
      loadMore();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Micro Feed</h1>
          <p className="text-gray-600 mb-8">
            Share your thoughts in 280 characters or less
          </p>

          <button
            onClick={handleSignIn}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Sign in with GitHub</span>
          </button>

          <p className="text-sm text-gray-500 mt-4">
            You'll need to authenticate to create and interact with posts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Micro Feed</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Composer */}
          <Composer onPostCreated={addOptimisticPost} />

          {/* Toolbar */}
          <Toolbar
            query={query}
            filter={filter}
            onSearch={search}
            onFilterChange={changeFilter}
            onRefresh={refresh}
            isLoading={postsLoading}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Error: {error}</p>
              <button
                onClick={refresh}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Posts */}
          {posts.length === 0 && !postsLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1-2H8l-1 2H5V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No posts found
              </h3>
              <p className="text-gray-500">
                {query || filter === "mine"
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to share something!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                  onUpdate={updateOptimisticPost}
                  onDelete={removeOptimisticPost}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={postsLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {postsLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {/* End of feed message */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>You've reached the end! 🎉</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
