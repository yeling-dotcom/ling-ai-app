import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Watch", description: "Videos about creativity, work, and technology." };
export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const supabase = await createClient();
  const { data: videos, error } = await supabase.from("videos").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  return <main><p className="eyebrow">Watch & listen</p><h1>Ideas in motion.</h1><p className="lede">Studio notes, practical walkthroughs, and conversations.</p>
    {error ? <div className="empty">Videos could not be loaded.</div> : !videos?.length ? <div className="empty">No videos yet.</div> :
    <section className="video-grid">{videos.map(video => <article className="video-card" key={video.id}><iframe src={video.embed_url} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" /><h2>{video.title}</h2><p className="lede">{video.description}</p></article>)}</section>}</main>;
}
