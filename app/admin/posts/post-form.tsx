"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Post = { id: string; title: string; slug: string; body: string | null; excerpt: string | null; cover_image_url: string | null; status: string };

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("saving");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(post ? `/api/admin/posts/${post.id}` : "/api/admin/posts", { method: post ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) return setState("error");
    router.push("/admin/posts"); router.refresh();
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
  </form>;
}
