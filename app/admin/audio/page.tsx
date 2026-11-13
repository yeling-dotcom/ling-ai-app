import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../admin-nav";
import { AudioManager } from "./audio-manager";
import { getOrganizationForUser } from "@/lib/organization";

export const dynamic = "force-dynamic";

const isAudioUrl = (url: string) => /\.(mp3|m4a)(?:$|[?#])/i.test(url);

export default async function AudioAdminPage() {
  const supabase = await createClient();
  const context = await getOrganizationForUser();
  const { data } = await supabase.from("videos").select("*").eq("organization_id", context!.organization.id).is("deleted_at", null).order("created_at", { ascending: false });
  const tracks = data?.filter(track => isAudioUrl(track.embed_url)) ?? [];
  return <main><div className="admin-shell"><AdminNav /><section>
    <p className="eyebrow">Sound desk</p>
    <h2>Audio</h2>
    <p className="lede">Upload your original MP3 or M4A music for visitors to enjoy.</p>
    <AudioManager initialTracks={tracks} />
  </section></div></main>;
}
