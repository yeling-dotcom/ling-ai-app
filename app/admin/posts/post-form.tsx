"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string; title: string; slug: string; body: string | null; excerpt: string | null;
  cover_image_url: string | null; status: string; ai_summary: string | null;
  ai_summary_confidence: number | null; ai_summary_review_status: string | null;
  ai_tags: string[] | null; ai_tags_confidence: number | null; ai_tags_review_status: string | null;
};

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("saving");
    const formData = new FormData(event.currentTarget);
    // AI review fields have their own Accept/Reject actions. Do not include them
    // in the main post save, because ai_tags is stored as a Postgres text array.
    formData.delete("ai_summary");
    formData.delete("ai_tags");
    const body = Object.fromEntries(formData);
    const response = await fetch(post ? `/api/admin/posts/${post.id}` : "/api/admin/posts", { method: post ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) return setState("error");
    router.push("/admin/posts"); router.refresh();
  }
  async function review(kind: "summary" | "tags", status: "accepted" | "rejected") {
    if (!post) return;
    const summary = (document.querySelector("[name=ai_summary]") as HTMLTextAreaElement | null)?.value;
    const tags = (document.querySelector("[name=ai_tags]") as HTMLInputElement | null)?.value
      .split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 5);
    const body = kind === "summary"
      ? { ai_summary: summary, ai_summary_review_status: status }
      : { ai_tags: tags, ai_tags_review_status: status };
    setState("saving");
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    setState(response.ok ? "idle" : "error");
    if (response.ok) router.refresh();
  }
  return <form className="admin-form" onSubmit={submit}>
    <label>Title<input name="title" defaultValue={post?.title ?? ""} required /></label>
    {post && <label>Slug<input name="slug" defaultValue={post.slug} required /></label>}
    <label>Excerpt<textarea name="excerpt" rows={3} defaultValue={post?.excerpt ?? ""} /></label>
    <label>Cover image URL<input name="cover_image_url" type="url" defaultValue={post?.cover_image_url ?? ""} /></label>
    <label>Body<textarea name="body" rows={14} defaultValue={post?.body ?? ""} required /></label>
    <label>Status<select name="status" defaultValue={post?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label>
    <button className="primary-button" disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Save post"}</button>
    {state === "error" && <p className="form-error">The post could not be saved.</p>}
    {post && <section className="ai-review">
      <div className="ai-review-heading"><div><p className="eyebrow">AI assistant</p><h3>Summary</h3></div>{post.ai_summary_confidence !== null && <span className={`confidence ${(post.ai_summary_confidence ?? 0) < .7 ? "low" : ""}`}>{Math.round((post.ai_summary_confidence ?? 0) * 100)}% confidence</span>}</div>
      <textarea name="ai_summary" rows={3} defaultValue={post.ai_summary ?? ""} placeholder="Save the post to generate a summary when OpenAI is configured." />
      <p className="meta">Review status: {post.ai_summary_review_status ?? "unreviewed"}</p>
      <div className="admin-actions"><button type="button" onClick={() => review("summary", "accepted")}>Accept</button><button type="button" onClick={() => review("summary", "rejected")}>Reject</button></div>
      <div className="ai-review-heading"><div><p className="eyebrow">AI assistant</p><h3>Tags</h3></div>{post.ai_tags_confidence !== null && <span className={`confidence ${(post.ai_tags_confidence ?? 0) < .7 ? "low" : ""}`}>{Math.round((post.ai_tags_confidence ?? 0) * 100)}% confidence</span>}</div>
      <input name="ai_tags" defaultValue={post.ai_tags?.join(", ") ?? ""} placeholder="AI, creativity, process" />
      <p className="meta">Review status: {post.ai_tags_review_status ?? "unreviewed"}</p>
      <div className="admin-actions"><button type="button" onClick={() => review("tags", "accepted")}>Accept</button><button type="button" onClick={() => review("tags", "rejected")}>Reject</button></div>
    </section>}
  </form>;
}
