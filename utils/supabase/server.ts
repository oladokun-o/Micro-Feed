// lib/supabase/server.ts
import { createServerSupabaseClient } from "@/lib/db";
import { cookies } from "next/headers";

export function getSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerSupabaseClient(cookieStore);
}
