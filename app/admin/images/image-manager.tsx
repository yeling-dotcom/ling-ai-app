"use client";

import { FormEvent, useState } from "react";

type ImageRow = { id: string; url: string; alt_text: string | null; caption: string | null };

export function ImageManager({ initialImages }: { initialImages: ImageRow[] }) {
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setUploading(true);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/admin/images", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) return setError(result.error ?? "The image could not be uploaded.");
      setImages(current => [result.image, ...current]); form.reset();
    } catch {
      setError("The image could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
    }
  }
  async function edit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setError(""); setUploading(true);
    const form = event.currentTarget;
    try {
      const response = await fetch(`/api/admin/images/${id}`, { method: "PATCH", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) return setError(result.error ?? "The image could not be updated.");
      setImages(current => current.map(item => item.id === id ? result.image : item));
      form.reset();
    } catch {
      setError("The image could not be updated. Please try again.");
    } finally {
      setUploading(false);
    }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this image from the gallery?")) return;
    const response = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    if (response.ok) setImages(current => current.filter(item => item.id !== id));
  }
  return <><form className="admin-form compact" onSubmit={create}><label>Image file<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required /></label><p className="meta">JPG, PNG, WebP, or GIF; maximum 4 MB.</p><label>Alt text<input name="alt_text" minLength={2} maxLength={300} required /></label><label>Caption<input name="caption" maxLength={1000} /></label><button className="primary-button" disabled={uploading}>{uploading ? "Uploading…" : "Upload image"}</button>{error && <p className="form-error" role="alert">{error}</p>}</form><div className="media-admin-grid">{images.map(image => <article className="media-admin-card" key={image.id}><img src={image.url} alt={image.alt_text ?? ""} /><form onSubmit={event => edit(event, image.id)}><label>Replace image<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label><p className="meta">Leave empty to keep the current image.</p><label>Alt text<input name="alt_text" defaultValue={image.alt_text ?? ""} minLength={2} maxLength={300} required /></label><label>Caption<input name="caption" defaultValue={image.caption ?? ""} maxLength={1000} /></label><div className="admin-actions"><button disabled={uploading}>{uploading ? "Saving…" : "Save"}</button><button type="button" className="danger" onClick={() => remove(image.id)}>Delete</button></div></form></article>)}</div>{!images.length && <div className="empty">No images yet.</div>}</>;
}
