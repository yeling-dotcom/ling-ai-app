"use client";

import Link from "next/link";
import { useState } from "react";

type Post = { id: string; title: string; slug: string; excerpt: string | null; status: string; published_at: string | null };

export function PostList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  async function publish(post: Post) {
    const status = post.status === "published" ? "draft" : "published";
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, published_at: post.published_at }) });
    if (response.ok) { const { post: saved } = await response.json(); setPosts(current => current.map(item => item.id === saved.id ? saved : item)); }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this post from the site?")) return;
    const response = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (response.ok) setPosts(current => current.filter(post => post.id !== id));
  }
  if (!posts.length) return <div className="empty">No posts yet. Create the first draft.</div>;
  return <div className="admin-list">{posts.map(post => <article className="admin-card" key={post.id}><div><span className={`status ${post.status}`}>{post.status}</span><h3>{post.title}</h3><p>{post.excerpt || "No excerpt yet."}</p></div><div className="admin-actions"><Link href={`/admin/posts/${post.id}/edit`}>Edit</Link><button onClick={() => publish(post)}>{post.status === "published" ? "Unpublish" : "Publish"}</button><button className="danger" onClick={() => remove(post.id)}>Delete</button></div></article>)}</div>;
}
