import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const url = String(body.url ?? "").trim();
  const alt_text = String(body.alt_text ?? "").trim();
  if (!/^https?:\/\//.test(url) || alt_text.length < 2) return NextResponse.json({ error: "A valid image URL and alt text are required." }, { status: 422 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("images").insert({ url, alt_text, caption: String(body.caption ?? "").trim() }).select("*").single();
  if (error) return NextResponse.json({ error: "Image could not be saved." }, { status: 500 });
  return NextResponse.json({ image: data }, { status: 201 });
}
