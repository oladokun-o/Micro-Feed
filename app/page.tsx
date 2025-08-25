import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/db";
import ClientHome from "./client-home";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Initial posts load
  const { data: posts } = await supabase.from("posts").select("*");

  return (
    <ClientHome
      user={user}
      initialPosts={posts ?? []}
    />
  );
}
