"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Video = { id: string; title: string; embed_url: string; description: string | null; thumbnail_url: string | null };

export function VideoManager({ initialVideos }: { initialVideos: Video[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const file = fields.get("file");
    fields.delete("file");
    setError("");
    setSaving(true);

    try {
      if (file instanceof File && file.size > 0) {
        if (!/\.mp4$/i.test(file.name) || file.size > 6 * 1024 * 1024) {
          throw new Error("Choose an MP4 video up to 6 MB.");
        }
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in again.");
        const bucket = supabase.storage.from("videos");
        const path = `${user.id}/${crypto.randomUUID()}.mp4`;
        const { error } = await bucket.upload(path, file, { contentType: "video/mp4" });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        fields.set("embed_url", bucket.getPublicUrl(path).data.publicUrl);
      }
      if (!String(fields.get("embed_url") ?? "").trim()) {
        throw new Error("Choose an MP4 file or enter an embed URL.");
      }
      const response = await fetch(id ? `/api/admin/videos/${id}` : "/api/admin/videos", {
        method: id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The video could not be saved.");
      const video: Video = result.video;
      setVideos(current => id ? current.map(item => item.id === id ? video : item) : [video, ...current]);
      if (!id) form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "The video could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this video?")) return;
    setError("");
    const response = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (response.ok) return setVideos(current => current.filter(item => item.id !== id));
    const result = await response.json().catch(() => ({}));
    setError(result.error ?? "The video could not be removed.");
  }
  return <><form className="admin-form compact" onSubmit={event => save(event)}><label>Title<input name="title" required /></label><label>Choose video<input name="file" type="file" accept=".mp4,video/mp4" /></label><p className="meta">MP4 up to 6 MB, or enter an embed URL.</p><label>Embed URL<input name="embed_url" type="url" /></label><label>Description<textarea name="description" rows={3} /></label><label>Thumbnail URL<input name="thumbnail_url" type="url" /></label><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Add video"}</button></form>{error && <p className="form-error" role="alert">{error}</p>}<div className="admin-list">{videos.map(video => <article className="admin-card stacked" key={JSON.stringify(video)}><form className="admin-form compact" onSubmit={event => save(event, video.id)}><label>Title<input name="title" defaultValue={video.title} /></label><label>Replace video<input name="file" type="file" accept=".mp4,video/mp4" /></label><label>Video URL<input name="embed_url" type="url" defaultValue={video.embed_url} /></label><label>Description<textarea name="description" rows={3} defaultValue={video.description ?? ""} /></label><label>Thumbnail URL<input name="thumbnail_url" type="url" defaultValue={video.thumbnail_url ?? ""} /></label><div className="admin-actions"><button disabled={saving}>Save</button><button type="button" className="danger" disabled={saving} onClick={() => remove(video.id)}>Delete</button></div></form></article>)}</div>{!videos.length && <div className="empty">No videos yet.</div>}</>;
}
