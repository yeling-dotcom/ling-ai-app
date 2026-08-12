import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getOrganizationForUser } from "@/lib/organization";

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
  const context = await getOrganizationForUser();
  if (!context) return NextResponse.json({ error: "Organization membership required." }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  const selectedFile = file instanceof File && file.size > 0 ? file : null;
  const url = String(formData.get("url") ?? "").trim();
  const alt_text = String(formData.get("alt_text") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const hasFile = Boolean(selectedFile);
  if (!hasFile && !/^https:\/\//i.test(url)) {
    return NextResponse.json({ error: "Choose an image file or enter a valid HTTPS image URL." }, { status: 422 });
  }
  if (selectedFile && !allowedImageTypes[selectedFile.type]) {
    return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or GIF image." }, { status: 422 });
  }
  if (selectedFile && selectedFile.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "The image must be smaller than 4 MB." }, { status: 413 });
  }
  if (alt_text.length < 2 || alt_text.length > 300 || caption.length < 2 || caption.length > 1000) {
    return NextResponse.json({ error: "Add a title and 2–300 characters of alt text." }, { status: 422 });
  }

  let imageUrl = url;
  let storagePath: string | null = null;
  if (selectedFile) {
    storagePath = `${user.id}/${crypto.randomUUID()}.${allowedImageTypes[selectedFile.type]}`;
    const { error: uploadError } = await supabase.storage.from("images").upload(storagePath, selectedFile, {
      cacheControl: "3600", contentType: selectedFile.type, upsert: false,
    });
    if (uploadError) {
      console.error("Image upload failed", uploadError.message);
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
    }
    imageUrl = supabase.storage.from("images").getPublicUrl(storagePath).data.publicUrl;
  }
  const { data, error } = await supabase.from("images").insert({
    organization_id: context.organization.id,
    user_id: user.id,
    url: imageUrl,
    alt_text,
    caption,
  }).select("*").single();
  if (error) {
    if (storagePath) {
      const { error: cleanupError } = await supabase.storage.from("images").remove([storagePath]);
      if (cleanupError) console.error("Failed to clean up uploaded image", cleanupError.message);
    }
    return NextResponse.json({ error: "Image metadata could not be saved." }, { status: 500 });
  }
  await logAudit(supabase, { action: "create", table_name: "images", organization_id: context.organization.id, row_id: data.id, actor_user_id: user.id, new_value: data });
  return NextResponse.json({ image: data }, { status: 201 });
}
