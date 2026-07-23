import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function logPageView(pagePath: string) {
  try {
    const requestHeaders = await headers();
    const supabase = await createClient();
    await supabase.from("visitor_events").insert({
      page_path: pagePath,
      referrer: requestHeaders.get("referer"),
      user_agent: requestHeaders.get("user-agent"),
      session_id: requestHeaders.get("x-vercel-id") ?? crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Visitor event logging failed", error);
  }
}
