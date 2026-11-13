import { createClient } from "@/lib/supabase/server";
import { logPageView } from "@/lib/analytics";
import { getPublicOrganization } from "@/lib/organization";

export const metadata = { title: "Audio", description: "Original music and sounds by Ling." };
export const dynamic = "force-dynamic";

const isAudioUrl = (url: string) => /\.(mp3|m4a)(?:$|[?#])/i.test(url);

export default async function AudioPage() {
  const publicOrganization = await getPublicOrganization();
  await logPageView("/audio", publicOrganization?.organization.id);
  const supabase = await createClient();
  let query = supabase.from("videos").select("*").is("deleted_at", null);
  if (publicOrganization) query = query.eq("organization_id", publicOrganization.organization.id);
  const { data, error } = await query.order("created_at", { ascending: false });
  const tracks = data?.filter(track => isAudioUrl(track.embed_url)) ?? [];

  return <main>
    <p className="eyebrow">Original sounds</p>
    <h1>Music, made here.</h1>
    <p className="lede">Original songs, sketches, and sound experiments by Ling.</p>
    {error ? <div className="empty">Music could not be loaded.</div> : !tracks.length ? <div className="empty">No music yet.</div> :
      <section className="audio-grid">{tracks.map(track =>
        <article className="audio-card" key={track.id}>
          <div className="audio-cover">
            {track.thumbnail_url
              ? <img src={track.thumbnail_url} alt="" />
              : <span aria-hidden="true">♪</span>}
          </div>
          <div className="audio-copy">
            <h2>{track.title}</h2>
            {track.description && <p>{track.description}</p>}
            <audio src={track.embed_url} controls preload="metadata" aria-label={track.title} />
          </div>
        </article>)}</section>}
  </main>;
}
