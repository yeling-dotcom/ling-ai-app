import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePostIntelligence } from "@/lib/ai";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const content = String(body.body ?? "").trim();
  const status = body.status === "published" ? "published" : "draft";
  if (title.length < 3 || content.length < 20) return NextResponse.json({ error: "A title and at least 20 characters of body text are required." }, { status: 422 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").insert({
    title,
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    body: content,
    excerpt: String(body.excerpt ?? "").trim(),
    cover_image_url: String(body.cover_image_url ?? "").trim() || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  }).select("*").single();
  if (error) return NextResponse.json({ error: "Post could not be saved." }, { status: 500 });

  const intelligence = await generatePostIntelligence(title, content);
  if (!intelligence) return NextResponse.json({ post: data, ai_status: "unavailable" }, { status: 201 });
  const { data: enriched, error: aiSaveError } = await supabase
    .from("posts")
    .update(intelligence)
    .eq("id", data.id)
    .select("*")
    .single();
  if (aiSaveError) console.error("Post intelligence save failed", aiSaveError.code);
  return NextResponse.json({ post: enriched ?? data, ai_status: aiSaveError ? "save_failed" : "generated" }, { status: 201 });
}
