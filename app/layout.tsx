import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ling — Notes on creativity and technology",
    template: "%s · Ling",
  },
  description: "Writing, images, and experiments from Ling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="wordmark" href="/">LING<span>.</span></Link>
          <nav aria-label="Main navigation">
            <Link href="/">Journal</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/videos">Watch</Link>
            <Link href="/contact">Contact</Link>
            <Link className="admin-link" href="/admin/posts">Studio</Link>
          </nav>
        </header>
        {children}
        <footer>
          <p>Made thoughtfully in Kuala Lumpur.</p>
          <p>© {new Date().getFullYear()} Ling</p>
        </footer>
      </body>
    </html>
  );
}
