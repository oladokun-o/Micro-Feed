import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db";
import { updatePostSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Check if the post exists and belongs to the user
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the post
    const { data: updatedPost, error: updateError } = await supabase
      .from("posts")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
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
      .single();

    if (updateError) {
      console.error("Error updating post:", updateError);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    // Transform the data to include like information
    const transformedPost = {
      ...updatedPost,
      isLiked: updatedPost.likes.some((like: any) => like.user_id === user.id),
      _count: {
        likes: updatedPost.likes.length,
      },
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Unexpected error in PATCH /api/posts/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the post exists and belongs to the user
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the post (likes will be deleted automatically due to cascade)
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/posts/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
