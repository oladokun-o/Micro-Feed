"use client";

import type { FilterType } from "@/types/post";
import { SearchBar } from "./search-bar";

interface ToolbarProps {
  query: string;
  filter: FilterType;
  onSearch: (query: string) => void;
  onFilterChange: (filter: FilterType) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function Toolbar({
  query,
  filter,
  onSearch,
  onFilterChange,
  onRefresh,
  isLoading = false,
}: ToolbarProps) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar
            initialValue={query}
            onSearch={onSearch}
            placeholder="Search posts..."
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onFilterChange("all")}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                filter === "all"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => onFilterChange("mine")}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                filter === "mine"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Posts
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50"
            title="Refresh posts"
          >
            <svg
              className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {(query || filter === "mine") && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {filter === "mine" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                My Posts
              </span>
            )}
            {query && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                "{query}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
