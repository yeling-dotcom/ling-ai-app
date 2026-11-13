import { createClient } from "@/lib/supabase/server";
import { logPageView } from "@/lib/analytics";
import { getPublicOrganization } from "@/lib/organization";
import { notFound } from "next/navigation";

export const metadata = { title: "Watch", description: "Videos about creativity, work, and technology." };
export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const publicOrganization = await getPublicOrganization();
  if (publicOrganization && !publicOrganization.settings.videos_enabled) notFound();
  await logPageView("/videos", publicOrganization?.organization.id);
  const supabase = await createClient();
  let query = supabase.from("videos").select("*").is("deleted_at", null);
  if (publicOrganization) query = query.eq("organization_id", publicOrganization.organization.id);
  const { data: videos, error } = await query.order("created_at", { ascending: false });
  const videoItems = videos?.filter(video => !/\.(mp3|m4a)(?:$|[?#])/i.test(video.embed_url)) ?? [];
  return <main><p className="eyebrow">Watch & listen</p><h1>Ideas in motion.</h1><p className="lede">Studio notes, practical walkthroughs, and conversations.</p>
    {error ? <div className="empty">Videos could not be loaded.</div> : !videoItems.length ? <div className="empty">No videos yet.</div> :
    <section className="video-grid">{videoItems.map(video => <article className="video-card" key={video.id}>{video.embed_url.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")}/storage/v1/object/public/videos/`) && video.embed_url.endsWith(".mp4")
      ? <video src={video.embed_url} aria-label={video.title} controls playsInline preload="metadata" poster={video.thumbnail_url ?? undefined} />
      : <iframe src={video.embed_url} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />}<h2>{video.title}</h2><p className="lede">{video.description}</p></article>)}</section>}</main>;
}
