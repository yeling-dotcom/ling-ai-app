import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Gallery", description: "A visual notebook of places and moments." };
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: images, error } = await supabase.from("images").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  return <main>
    <p className="eyebrow">Visual notebook</p><h1>Moments, collected.</h1><p className="lede">Places, textures, and fragments that stopped me in my tracks.</p>
    {error ? <div className="empty">The gallery could not be loaded.</div> : !images?.length ? <div className="empty">No images yet.</div> :
      <section className="gallery-grid">{images.map(image => <figure className="gallery-item" key={image.id}><Image src={image.url} width={800} height={600} alt={image.alt_text ?? ""} /><figcaption>{image.caption || image.alt_text}</figcaption></figure>)}</section>}
  </main>;
}
