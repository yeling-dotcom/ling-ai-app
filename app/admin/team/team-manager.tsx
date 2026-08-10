"use client";

import { FormEvent, useState } from "react";

type Member = { user_id: string; role: string; created_at: string };
type Invitation = { id: string; email: string; role: string; token: string; expires_at: string; accepted_at: string | null };

export function TeamManager({ members, invitations: initialInvitations, canInvite, memberLimit, appUrl }: { members: Member[]; invitations: Invitation[]; canInvite: boolean; memberLimit: number; appUrl: string }) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [message, setMessage] = useState("");
  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const response = await fetch("/api/admin/team/invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error ?? "Invitation could not be created.");
    setInvitations(current => [result.invitation, ...current]);
    setMessage("Invitation created. Copy its link and send it to the teammate.");
    event.currentTarget.reset();
  }
  return <>
    <p className="meta">{members.length} of {memberLimit} member seats used.</p>
    {canInvite && <form className="admin-form compact" onSubmit={invite}><label>Email<input name="email" type="email" required /></label><label>Role<select name="role"><option value="editor">Editor</option><option value="reviewer">Reviewer</option></select></label><button className="primary-button">Create invitation</button>{message && <p role="status" className="meta">{message}</p>}</form>}
    <h3>Members</h3><div className="admin-list">{members.map(member => <article className="admin-card" key={member.user_id}><div><strong>{member.role}</strong><p className="meta">User {member.user_id}</p></div></article>)}</div>
    <h3>Invitations</h3>{invitations.length ? <div className="admin-list">{invitations.map(invitation => { const url = `${appUrl}/invite/${invitation.token}`; return <article className="admin-card" key={invitation.id}><div><strong>{invitation.email}</strong><p>{invitation.role} · {invitation.accepted_at ? "accepted" : `expires ${new Date(invitation.expires_at).toLocaleDateString()}`}</p>{!invitation.accepted_at && <input readOnly value={url} aria-label={`Invitation link for ${invitation.email}`} />}</div></article>; })}</div> : <div className="empty">No invitations yet.</div>}
  </>;
}
