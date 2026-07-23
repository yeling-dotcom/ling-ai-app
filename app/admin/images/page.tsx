import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../admin-nav";
import { ImageManager } from "./image-manager";

export const dynamic = "force-dynamic";

export default async function ImagesAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("images").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Visual notebook</p><h2>Images</h2><p className="lede">Add hosted images with accessible alt text, edit captions, or remove them from the gallery.</p><ImageManager initialImages={data ?? []} /></section></div></main>;
}
