"use client";

import { useState } from "react";

type Task = { id: string; kind: string; proposed_value: unknown; confidence: number | null; posts: { title?: string } | { title?: string }[] | null };

export function ReviewQueue({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  async function review(id: string, status: "accepted" | "rejected") {
    const response = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    if (response.ok) setTasks(current => current.filter(task => task.id !== id));
  }
  if (!tasks.length) return <div className="empty">No AI suggestions are waiting for review.</div>;
  return <div className="admin-list">{tasks.map(task => { const post = Array.isArray(task.posts) ? task.posts[0] : task.posts; return <article className="admin-card" key={task.id}><div><span className="status draft">{task.kind}</span><h3>{post?.title ?? "Post"}</h3><pre>{typeof task.proposed_value === "string" ? task.proposed_value : JSON.stringify(task.proposed_value, null, 2)}</pre><p className="meta">{task.confidence === null ? "No confidence score" : `${Math.round(task.confidence * 100)}% confidence`}</p></div><div className="admin-actions"><button onClick={() => review(task.id, "accepted")}>Accept</button><button className="danger" onClick={() => review(task.id, "rejected")}>Reject</button></div></article>; })}</div>;
}
