import { NextRequest, NextResponse } from "next/server";
import { createBrowserSupabaseClient } from "@/lib/db";
import { createPostSchema, postsQuerySchema } from "@/lib/validators";
import { encodeCursor, decodeCursor, DEFAULT_LIMIT } from "@/lib/pagination";
import type { Post, PostsResponse } from "@/types/post";

export async function GET(request: NextRequest) {
  try {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      query: searchParams.get("query") || undefined,
      cursor: searchParams.get("cursor") || undefined,
      filter: searchParams.get("filter") || "all",
      limit: parseInt(searchParams.get("limit") || DEFAULT_LIMIT.toString()),
    };

    const validation = postsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { query, cursor, filter, limit } = validation.data;

    let queryBuilder = supabase
      .from("posts")
      .select(
        `
        *,
        profiles!posts_author_id_fkey (
          id,
          username
        ),
        likes (
          user_id
        )
      `
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1); // Get one extra to check if there are more

    // Apply search filter
    if (query) {
      queryBuilder = queryBuilder.ilike("content", `%${query}%`);
    }

    // Apply user filter
    if (filter === "mine") {
      queryBuilder = queryBuilder.eq("author_id", user.id);
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      if (decodedCursor) {
        queryBuilder = queryBuilder.or(
          `created_at.lt.${decodedCursor.created_at},and(created_at.eq.${decodedCursor.created_at},id.lt.${decodedCursor.id})`
        );
      }
    }

    const { data: postsData, error } = await queryBuilder;

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    const hasMore = postsData.length > limit;
    const posts = hasMore ? postsData.slice(0, -1) : postsData;

    // Transform the data to include like information
    const transformedPosts: Post[] = posts.map((post: any) => ({
      ...post,
      isLiked: post.likes.some((like: any) => like.user_id === user.id),
      _count: {
        likes: post.likes.length,
      },
    }));

    let nextCursor: string | undefined;
    if (hasMore && posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      nextCursor = encodeCursor(lastPost.created_at, lastPost.id);
    }

    const response: PostsResponse = {
      posts: transformedPosts,
      nextCursor,
      hasMore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Create the post
    const { data: post, error: createError } = await supabase
      .from("posts")
      .insert({
        content,
        author_id: user.id,
      })
      .select(
        `
        *,
        profiles!posts_author_id_fkey (
          id,
          username
        )
      `
      )
      .single();

    if (createError) {
      console.error("Error creating post:", createError);
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
    }

    // Add like information
    const transformedPost: Post = {
      ...post,
      likes: [],
      isLiked: false,
      _count: {
        likes: 0,
      },
    };

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
