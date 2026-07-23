import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
    }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

for (const table of ["posts", "images", "videos", "contact_messages", "visitor_events"]) {
  const { error } = await db.from(table).select("id").limit(1);
  if (error) throw error;
  console.log(`${table}: ready`);
}

const stamp = Date.now();
const { data: post, error: postError } = await db.from("posts").insert({
  title: "Admin Smoke Post", slug: `admin-smoke-${stamp}`, body: "Temporary body that verifies the complete publishing workflow.",
  excerpt: "Temporary publishing test.", status: "draft",
}).select("*").single();
if (postError) throw postError;
const { data: published, error: publishError } = await db.from("posts").update({ status: "published", published_at: new Date().toISOString() }).eq("id", post.id).select("*").single();
if (publishError || published.status !== "published") throw publishError ?? new Error("Publish failed.");

const { data: image, error: imageError } = await db.from("images").insert({
  url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800", alt_text: "Temporary admin smoke image", caption: "Temporary test",
}).select("*").single();
if (imageError) throw imageError;
const { data: video, error: videoError } = await db.from("videos").insert({
  title: "Admin Smoke Video", embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Temporary test",
}).select("*").single();
if (videoError) throw videoError;
const { data: message, error: messageError } = await db.from("contact_messages").insert({
  sender_name: "Admin Smoke", sender_email: "admin-smoke@example.com", message: "Temporary inbox test.",
}).select("*").single();
if (messageError) throw messageError;
const { data: read, error: readError } = await db.from("contact_messages").update({ is_read: true }).eq("id", message.id).select("*").single();
if (readError || !read.is_read) throw readError ?? new Error("Inbox update failed.");

await db.from("posts").delete().eq("id", post.id);
await db.from("images").delete().eq("id", image.id);
await db.from("videos").delete().eq("id", video.id);
await db.from("contact_messages").delete().eq("id", message.id);
console.log("owner workflow: draft → publish → media CRUD → inbox update → cleanup passed");
