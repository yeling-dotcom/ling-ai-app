"use client";

import { FormEvent, useState } from "react";
import type { Organization, OrganizationSettings } from "@/lib/organization";

export function SettingsForm({ organization, settings, canEdit }: { organization: Organization; settings: OrganizationSettings; canEdit: boolean }) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const body = {
      name: data.get("name"), theme: data.get("theme"),
      gallery_enabled: data.has("gallery_enabled"), videos_enabled: data.has("videos_enabled"),
      contact_enabled: data.has("contact_enabled"), analytics_enabled: data.has("analytics_enabled"),
      ai_review_enabled: data.has("ai_review_enabled"),
    };
    const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    setMessage(response.ok ? "Settings saved. Refresh the public site to see the changes." : result.error ?? "Settings could not be saved.");
    setSaving(false);
  }
  return <form className="admin-form" onSubmit={submit}>
    <label>Organization name<input name="name" defaultValue={organization.name} disabled={!canEdit} minLength={2} maxLength={80} /></label>
    <label>Theme<select name="theme" defaultValue={settings.theme} disabled={!canEdit}>
      <option value="editorial">Editorial</option><option value="garden" disabled={organization.plan !== "pro"}>Garden {organization.plan !== "pro" ? "(Pro)" : ""}</option><option value="minimal" disabled={organization.plan !== "pro"}>Minimal {organization.plan !== "pro" ? "(Pro)" : ""}</option>
    </select></label>
    <fieldset disabled={!canEdit}><legend>Enabled apps</legend>
      <label><input type="checkbox" name="gallery_enabled" defaultChecked={settings.gallery_enabled} /> Gallery</label>
      <label><input type="checkbox" name="videos_enabled" defaultChecked={settings.videos_enabled} /> Videos</label>
      <label><input type="checkbox" name="contact_enabled" defaultChecked={settings.contact_enabled} /> Contact</label>
      <label><input type="checkbox" name="analytics_enabled" defaultChecked={settings.analytics_enabled} /> Analytics</label>
      <label><input type="checkbox" name="ai_review_enabled" defaultChecked={settings.ai_review_enabled} disabled={organization.plan !== "pro"} /> Automated AI review queue {organization.plan !== "pro" ? "(Pro)" : ""}</label>
    </fieldset>
    {canEdit && <button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>}
    {message && <p className="meta" role="status">{message}</p>}
  </form>;
}
