import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../admin-nav";
import { VideoManager } from "./video-manager";

export const dynamic = "force-dynamic";

export default async function VideosAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("videos").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Watch desk</p><h2>Videos</h2><p className="lede">Manage the embedded videos visitors see.</p><VideoManager initialVideos={data ?? []} /></section></div></main>;
}
