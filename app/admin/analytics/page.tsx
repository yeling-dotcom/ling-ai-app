import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../admin-nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

type EventRow = { page_path: string; created_at: string };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("visitor_events")
    .select("page_path,created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  const events = (data ?? []) as EventRow[];
  const pageCounts = Object.entries(events.reduce<Record<string, number>>((counts, event) => {
    counts[event.page_path] = (counts[event.page_path] ?? 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  const dayCounts = Object.entries(events.reduce<Record<string, number>>((counts, event) => {
    const day = event.created_at.slice(0, 10);
    counts[day] = (counts[day] ?? 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[0].localeCompare(a[0]));

  return <main><div className="admin-shell"><AdminNav /><section>
    <p className="eyebrow">Last 30 days</p><h2>Analytics</h2>
    {error ? <div className="empty">Analytics could not be loaded.</div> : <>
      <div className="metric-grid"><article><strong>{events.length}</strong><span>Page views</span></article><article><strong>{pageCounts.length}</strong><span>Pages visited</span></article><article><strong>{dayCounts[0]?.[1] ?? 0}</strong><span>Views today</span></article></div>
      <div className="analytics-grid"><section><h3>Top pages</h3>{pageCounts.length ? <table><thead><tr><th>Path</th><th>Views</th></tr></thead><tbody>{pageCounts.map(([path, count]) => <tr key={path}><td>{path}</td><td>{count}</td></tr>)}</tbody></table> : <div className="empty">No page views yet.</div>}</section>
      <section><h3>Daily traffic</h3>{dayCounts.length ? <table><thead><tr><th>Date</th><th>Views</th></tr></thead><tbody>{dayCounts.slice(0, 14).map(([day, count]) => <tr key={day}><td>{new Date(`${day}T00:00:00`).toLocaleDateString("en-MY", { dateStyle: "medium" })}</td><td>{count}</td></tr>)}</tbody></table> : <div className="empty">No traffic yet.</div>}</section></div>
    </>}
  </section></div></main>;
}
