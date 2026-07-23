"use client";

import { FormEvent, useState } from "react";

type Video = { id: string; title: string; embed_url: string; description: string | null; thumbnail_url: string | null };

export function VideoManager({ initialVideos }: { initialVideos: Video[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [error, setError] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = event.currentTarget;
    const response = await fetch("/api/admin/videos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setVideos(current => [result.video, ...current]); form.reset();
  }
  async function edit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const response = await fetch(`/api/admin/videos/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    if (response.ok) { const { video } = await response.json(); setVideos(current => current.map(item => item.id === id ? video : item)); }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this video?")) return;
    const response = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (response.ok) setVideos(current => current.filter(item => item.id !== id));
  }
  return <><form className="admin-form compact" onSubmit={create}><label>Title<input name="title" required /></label><label>Embed URL<input name="embed_url" type="url" required /></label><label>Description<textarea name="description" rows={3} /></label><label>Thumbnail URL<input name="thumbnail_url" type="url" /></label><button className="primary-button">Add video</button>{error && <p className="form-error">{error}</p>}</form><div className="admin-list">{videos.map(video => <article className="admin-card stacked" key={video.id}><form className="admin-form compact" onSubmit={event => edit(event, video.id)}><label>Title<input name="title" defaultValue={video.title} /></label><label>Embed URL<input name="embed_url" type="url" defaultValue={video.embed_url} /></label><label>Description<textarea name="description" rows={3} defaultValue={video.description ?? ""} /></label><label>Thumbnail URL<input name="thumbnail_url" type="url" defaultValue={video.thumbnail_url ?? ""} /></label><div className="admin-actions"><button>Save</button><button type="button" className="danger" onClick={() => remove(video.id)}>Delete</button></div></form></article>)}</div>{!videos.length && <div className="empty">No videos yet.</div>}</>;
}
