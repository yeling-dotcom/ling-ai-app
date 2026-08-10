"use client";

import { FormEvent, useState } from "react";

type Membership = { organization_id: string; role: string; organizations: { id: string; name: string; slug: string; plan: string } | { id: string; name: string; slug: string; plan: string }[] | null };

export function OrganizationManager({ memberships, activeId }: { memberships: Membership[]; activeId: string }) {
  const [message, setMessage] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const response = await fetch("/api/admin/organizations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error ?? "Organization could not be created.");
    window.location.reload();
  }
  async function select(id: string) {
    const response = await fetch("/api/admin/organizations/active", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organization_id: id }) });
    if (response.ok) window.location.assign("/admin/posts");
  }
  return <><form className="admin-form compact" onSubmit={create}><label>Name<input name="name" minLength={2} maxLength={80} required /></label><label>Public slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="my-publication" required /></label><button className="primary-button">Create organization</button>{message && <p className="form-error">{message}</p>}</form><div className="admin-list">{memberships.map(membership => { const org = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations; return org && <article className="admin-card" key={membership.organization_id}><div><span className="status published">{org.plan}</span><h3>{org.name}</h3><p>/{org.slug} · {membership.role}</p></div><button disabled={org.id === activeId} onClick={() => select(org.id)}>{org.id === activeId ? "Active" : "Switch"}</button></article>; })}</div></>;
}
