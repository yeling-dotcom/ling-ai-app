import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../admin-nav";
import { ImageManager } from "./image-manager";
import { getOrganizationForUser } from "@/lib/organization";

export const dynamic = "force-dynamic";

export default async function ImagesAdminPage() {
  const supabase = await createClient();
  const context = await getOrganizationForUser();
  const { data } = await supabase.from("images").select("*").eq("organization_id", context!.organization.id).is("deleted_at", null).order("created_at", { ascending: false });
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Portfolio desk</p><h2>Manage artwork</h2><p className="lede">Choose an image from your computer, preview it, and publish it directly to the gallery.</p><ImageManager initialImages={data ?? []} /></section></div></main>;
}
