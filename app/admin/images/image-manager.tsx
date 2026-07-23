"use client";

import { FormEvent, useState } from "react";

type ImageRow = { id: string; url: string; alt_text: string | null; caption: string | null };

export function ImageManager({ initialImages }: { initialImages: ImageRow[] }) {
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = event.currentTarget;
    const response = await fetch("/api/admin/images", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setImages(current => [result.image, ...current]); form.reset();
  }
  async function edit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const response = await fetch(`/api/admin/images/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    if (response.ok) { const { image } = await response.json(); setImages(current => current.map(item => item.id === id ? image : item)); }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this image from the gallery?")) return;
    const response = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    if (response.ok) setImages(current => current.filter(item => item.id !== id));
  }
  return <><form className="admin-form compact" onSubmit={create}><label>Image URL<input name="url" type="url" required /></label><label>Alt text<input name="alt_text" required /></label><label>Caption<input name="caption" /></label><button className="primary-button">Add image</button>{error && <p className="form-error">{error}</p>}</form><div className="media-admin-grid">{images.map(image => <article className="media-admin-card" key={image.id}><img src={image.url} alt={image.alt_text ?? ""} /><form onSubmit={event => edit(event, image.id)}><label>URL<input name="url" type="url" defaultValue={image.url} /></label><label>Alt text<input name="alt_text" defaultValue={image.alt_text ?? ""} /></label><label>Caption<input name="caption" defaultValue={image.caption ?? ""} /></label><div className="admin-actions"><button>Save</button><button type="button" className="danger" onClick={() => remove(image.id)}>Delete</button></div></form></article>)}</div>{!images.length && <div className="empty">No images yet.</div>}</>;
}
