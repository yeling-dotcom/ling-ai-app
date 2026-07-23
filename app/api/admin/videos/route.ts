import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const embed_url = String(body.embed_url ?? "").trim();
  if (title.length < 2 || !/^https?:\/\//.test(embed_url)) return NextResponse.json({ error: "A title and valid embed URL are required." }, { status: 422 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("videos").insert({ title, embed_url, description: String(body.description ?? "").trim(), thumbnail_url: String(body.thumbnail_url ?? "").trim() || null }).select("*").single();
  if (error) return NextResponse.json({ error: "Video could not be saved." }, { status: 500 });
  return NextResponse.json({ video: data }, { status: 201 });
}
