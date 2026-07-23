"use client";

import { useState } from "react";

type Message = { id: string; created_at: string; sender_name: string; sender_email: string; message: string; is_read: boolean };

export function MessageInbox({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  async function mark(message: Message) {
    const response = await fetch(`/api/admin/messages/${message.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ is_read: !message.is_read }) });
    if (response.ok) { const { message: saved } = await response.json(); setMessages(current => current.map(item => item.id === saved.id ? saved : item)); }
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this message?")) return;
    const response = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (response.ok) setMessages(current => current.filter(item => item.id !== id));
  }
  if (!messages.length) return <div className="empty">No messages yet.</div>;
  return <div className="admin-list">{messages.map(message => <article className={`admin-card ${message.is_read ? "read" : ""}`} key={message.id}><div><span className="meta">{new Date(message.created_at).toLocaleString()}</span><h3>{message.sender_name}</h3><a href={`mailto:${message.sender_email}`}>{message.sender_email}</a><p>{message.message}</p></div><div className="admin-actions"><a href={`mailto:${message.sender_email}`}>Reply</a><button onClick={() => mark(message)}>{message.is_read ? "Mark unread" : "Mark read"}</button><button className="danger" onClick={() => remove(message.id)}>Delete</button></div></article>)}</div>;
}
