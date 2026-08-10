import type { Metadata } from "next";
import Link from "next/link";
import { getPublicOrganization } from "@/lib/organization";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Ling — Notes on creativity and technology",
    template: "%s · Ling",
  },
  description: "Writing, images, and experiments from Ling.",
  openGraph: { type: "website", siteName: "Ling", title: "Ling — Notes on creativity and technology", description: "Writing, images, and experiments from Ling." },
  twitter: { card: "summary_large_image", title: "Ling — Notes on creativity and technology", description: "Writing, images, and experiments from Ling." },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publicOrganization = await getPublicOrganization();
  const settings = publicOrganization?.settings;
  const siteName = publicOrganization?.organization.name ?? "Ling";
  return (
    <html lang="en">
      <body data-theme={settings?.theme ?? "editorial"}>
        <header className="site-header">
          <Link className="wordmark" href="/">{siteName.toUpperCase()}<span>.</span></Link>
          <nav aria-label="Main navigation">
            <Link href="/">Journal</Link>
            {settings?.gallery_enabled !== false && <Link href="/gallery">Gallery</Link>}
            {settings?.videos_enabled !== false && <Link href="/videos">Watch</Link>}
            {settings?.contact_enabled !== false && <Link href="/contact">Contact</Link>}
            <Link className="admin-link" href="/admin/posts">Studio</Link>
          </nav>
        </header>
        {children}
        <footer>
          <p>Made thoughtfully in Kuala Lumpur.</p>
          <p>© {new Date().getFullYear()} {siteName}</p>
        </footer>
      </body>
    </html>
  );
}
