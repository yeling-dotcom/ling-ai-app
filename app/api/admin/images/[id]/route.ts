import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getOrganizationForUser } from "@/lib/organization";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const context = await getOrganizationForUser(); if (!context) return NextResponse.json({ error: "Organization membership required." }, { status: 403 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("images").select("*").eq("id", id).eq("organization_id", context.organization.id).maybeSingle();
  if (!previous) return NextResponse.json({ error: "Image not found." }, { status: 404 });
  const formData = await request.formData();
  const file = formData.get("file");
  const requestedUrl = String(formData.get("url") ?? "").trim();
  const alt_text = String(formData.get("alt_text") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (alt_text.length < 2 || alt_text.length > 300 || caption.length < 2 || caption.length > 1000) return NextResponse.json({ error: "Add a title and 2–300 characters of alt text." }, { status: 422 });
  if (!/^https:\/\//i.test(requestedUrl)) return NextResponse.json({ error: "Enter a valid HTTPS image URL." }, { status: 422 });
  const allowedImageTypes: Record<string, string> = { "image/gif": "gif", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  let nextUrl = requestedUrl;
  let newStoragePath: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (!allowedImageTypes[file.type]) return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or GIF image." }, { status: 422 });
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "The image must be smaller than 4 MB." }, { status: 413 });
    newStoragePath = `${user.id}/${crypto.randomUUID()}.${allowedImageTypes[file.type]}`;
    const { error: uploadError } = await supabase.storage.from("images").upload(newStoragePath, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    if (uploadError) return NextResponse.json({ error: "Replacement image upload failed." }, { status: 500 });
    nextUrl = supabase.storage.from("images").getPublicUrl(newStoragePath).data.publicUrl;
  }
  const update = { url: nextUrl, alt_text, caption, user_id: user.id };
  const { data, error } = await supabase.from("images").update(update).eq("id", id).eq("organization_id", context.organization.id).select("*").single();
  if (error) {
    if (newStoragePath) await supabase.storage.from("images").remove([newStoragePath]);
    return NextResponse.json({ error: "Image could not be updated." }, { status: 500 });
  }
  if (newStoragePath) {
    const marker = "/storage/v1/object/public/images/";
    const oldPath = previous.url.includes(marker) ? decodeURIComponent(previous.url.split(marker)[1]) : null;
    if (oldPath) await supabase.storage.from("images").remove([oldPath]);
  }
  await logAudit(supabase, { action: "update", table_name: "images", organization_id: context.organization.id, row_id: data.id, actor_user_id: user.id, old_value: previous, new_value: data });
  return NextResponse.json({ image: data });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const context = await getOrganizationForUser(); if (!context) return NextResponse.json({ error: "Organization membership required." }, { status: 403 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("images").select("*").eq("id", id).eq("organization_id", context.organization.id).maybeSingle();
  const next = { deleted_at: new Date().toISOString(), user_id: user.id };
  const { error } = await supabase.from("images").update(next).eq("id", id).eq("organization_id", context.organization.id);
  if (error) return NextResponse.json({ error: "Image could not be removed." }, { status: 500 });
  await logAudit(supabase, { action: "soft_delete", table_name: "images", organization_id: context.organization.id, row_id: id, actor_user_id: user.id, old_value: previous, new_value: next });
  return NextResponse.json({ ok: true });
}
