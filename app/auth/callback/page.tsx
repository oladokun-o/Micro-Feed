import { createServerSupabaseClient } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthCallback() {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  // Supabase will automatically exchange the code in the URL for a session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    console.error("Auth callback error:", error?.message);
    redirect("/?error=auth_failed");
  }

  redirect("/"); // redirect to homepage after login
}
