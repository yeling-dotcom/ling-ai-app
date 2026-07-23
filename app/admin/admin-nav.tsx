import Link from "next/link";

export function AdminNav() {
  return <aside className="admin-nav">
    <p className="eyebrow">Studio</p>
    <Link href="/admin/posts">Posts</Link>
    <Link href="/admin/images">Images</Link>
    <Link href="/admin/videos">Videos</Link>
    <Link href="/admin/messages">Messages</Link>
    <Link href="/">View site ↗</Link>
  </aside>;
}
