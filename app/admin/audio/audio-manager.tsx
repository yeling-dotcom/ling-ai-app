"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Track = { id: string; title: string; embed_url: string; description: string | null; thumbnail_url: string | null };

export function AudioManager({ initialTracks }: { initialTracks: Track[] }) {
  const [tracks, setTracks] = useState(initialTracks);
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
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (!extension || !["mp3", "m4a"].includes(extension) || file.size > 15 * 1024 * 1024) {
          throw new Error("Choose an MP3 or M4A audio file up to 15 MB.");
        }
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in again.");
        const bucket = supabase.storage.from("videos");
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const contentType = extension === "mp3" ? "audio/mpeg" : "audio/mp4";
        const { error: uploadError } = await bucket.upload(path, file, { contentType });
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        fields.set("embed_url", bucket.getPublicUrl(path).data.publicUrl);
      }
      if (!String(fields.get("embed_url") ?? "").trim()) {
        throw new Error("Choose an audio file or enter an audio URL.");
      }
      const response = await fetch(id ? `/api/admin/videos/${id}` : "/api/admin/videos", {
        method: id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The track could not be saved.");
      const track: Track = result.video;
      setTracks(current => id ? current.map(item => item.id === id ? track : item) : [track, ...current]);
      if (!id) form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "The track could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this track?")) return;
    setError("");
    const response = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (response.ok) return setTracks(current => current.filter(item => item.id !== id));
    const result = await response.json().catch(() => ({}));
    setError(result.error ?? "The track could not be removed.");
  }

  const fields = (track?: Track) => <>
    <label>Title<input name="title" required defaultValue={track?.title ?? ""} /></label>
    <label>{track ? "Replace audio" : "Choose audio"}<input name="file" type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4" /></label>
    <label>Audio URL<input name="embed_url" type="url" defaultValue={track?.embed_url ?? ""} /></label>
    <label>Description<textarea name="description" rows={3} defaultValue={track?.description ?? ""} /></label>
    <label>Cover image URL<input name="thumbnail_url" type="url" defaultValue={track?.thumbnail_url ?? ""} /></label>
  </>;

  return <>{error && <p className="form-error" role="alert">{error}</p>}
    <form className="admin-form compact" onSubmit={event => save(event)}>
      {fields()}
      <p className="meta">MP3 or M4A up to 15 MB. Add a square cover image URL if you have one.</p>
      <button className="primary-button" disabled={saving}>{saving ? "Uploading…" : "Add track"}</button>
    </form>
    <div className="admin-list">{tracks.map(track =>
      <article className="admin-card stacked" key={track.id}>
        <form className="admin-form compact" onSubmit={event => save(event, track.id)}>
          {fields(track)}
          <div className="admin-actions"><button disabled={saving}>Save</button><button type="button" className="danger" disabled={saving} onClick={() => remove(track.id)}>Delete</button></div>
        </form>
      </article>)}</div>
    {!tracks.length && <div className="empty">No music yet.</div>}
  </>;
}
