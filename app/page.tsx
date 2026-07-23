import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,cover_image_url,published_at")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">An independent journal</p>
        <h1>Ideas worth keeping, stories worth sharing.</h1>
        <p className="lede">Notes on technology, creative work, and the small observations that make ordinary days feel expansive.</p>
      </section>
      <div className="section-heading">
        <h2>Latest writing</h2>
        <span className="count">{posts?.length ?? 0} published essays</span>
      </div>
      {error ? (
        <div className="empty">The journal could not be loaded. Please try again shortly.</div>
      ) : !posts?.length ? (
        <div className="empty">No posts yet. The first story is being prepared.</div>
      ) : (
        <section className="post-grid">
          {posts.map((post, index) => (
            <Link className="post-card" href={`/posts/${post.slug}`} key={post.id}>
              {post.cover_image_url && (
                <div className="post-image">
                  <Image src={post.cover_image_url} alt="" fill priority={index === 0} sizes={index === 0 ? "(max-width: 720px) 100vw, 55vw" : "(max-width: 720px) 100vw, 45vw"} />
                </div>
              )}
              <div className="post-copy">
                <span className="meta">{post.published_at ? new Date(post.published_at).toLocaleDateString("en-MY", { dateStyle: "long" }) : "New"}</span>
                {index === 0 ? <h2>{post.title}</h2> : <h3>{post.title}</h3>}
                <p>{post.excerpt}</p>
                <span className="eyebrow">Read story →</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
