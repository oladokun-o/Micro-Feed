import ClientHome from "./client-home";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = getSupabaseServerClient();

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
