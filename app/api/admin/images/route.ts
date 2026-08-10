import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const allowedImageTypes: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  const alt_text = String(formData.get("alt_text") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 422 });
  }
  if (!allowedImageTypes[file.type]) {
    return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or GIF image." }, { status: 422 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "The image must be smaller than 4 MB." }, { status: 413 });
  }
  if (alt_text.length < 2 || alt_text.length > 300 || caption.length > 1000) {
    return NextResponse.json({ error: "Add 2–300 characters of alt text; captions may be up to 1,000 characters." }, { status: 422 });
  }

  const storagePath = `${user.id}/${crypto.randomUUID()}.${allowedImageTypes[file.type]}`;
  const { error: uploadError } = await supabase.storage.from("images").upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    console.error("Image upload failed", uploadError.message);
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from("images").getPublicUrl(storagePath);
  const { data, error } = await supabase.from("images").insert({
    user_id: user.id,
    url: publicUrl.publicUrl,
    alt_text,
    caption,
  }).select("*").single();
  if (error) {
    const { error: cleanupError } = await supabase.storage.from("images").remove([storagePath]);
    if (cleanupError) console.error("Failed to clean up uploaded image", cleanupError.message);
    return NextResponse.json({ error: "Image metadata could not be saved." }, { status: 500 });
  }
  await logAudit(supabase, { action: "create", table_name: "images", row_id: data.id, actor_user_id: user.id, new_value: data });
  return NextResponse.json({ image: data }, { status: 201 });
}
