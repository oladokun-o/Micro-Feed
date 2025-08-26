import { getSupabaseServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the post exists
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", params.id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Try to create the like (will fail if already exists due to primary key constraint)
    const { error: likeError } = await supabase.from("likes").insert({
      post_id: params.id,
      user_id: user.id,
    });

    if (likeError) {
      // If it's a unique constraint violation, the user already liked this post
      if (likeError.code === "23505") {
        return NextResponse.json(
          { error: "Post already liked" },
          { status: 409 }
        );
      }
      console.error("Error creating like:", likeError);
      return NextResponse.json(
        { error: "Failed to like post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Unexpected error in POST /api/posts/[id]/like:", error);
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
    const supabase = getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the like
    const { error: unlikeError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", params.id)
      .eq("user_id", user.id);

    if (unlikeError) {
      console.error("Error removing like:", unlikeError);
      return NextResponse.json(
        { error: "Failed to unlike post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/posts/[id]/like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
