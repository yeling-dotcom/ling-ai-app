import Link from "next/link";

export function AdminNav() {
  return <aside className="admin-nav">
    <p className="eyebrow">Studio</p>
    <Link href="/admin/posts">Posts</Link>
    <Link href="/admin/images">Images</Link>
    <Link href="/admin/videos">Videos</Link>
    <Link href="/admin/messages">Messages</Link>
    <Link href="/admin/analytics">Analytics</Link>
    <Link href="/admin/reviews">AI reviews</Link>
    <Link href="/admin/team">Team</Link>
    <Link href="/admin/settings">Settings</Link>
    <Link href="/admin/billing">Billing</Link>
    <Link href="/admin/organizations">Organizations</Link>
    <Link href="/">View site ↗</Link>
    <form action="/auth/signout" method="post"><button className="nav-button">Sign out</button></form>
  </aside>;
}
