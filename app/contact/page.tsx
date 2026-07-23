import { logPageView } from "@/lib/analytics";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact", description: "Send Ling a message." };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  await logPageView("/contact");
  return <main><div className="contact-layout"><section><p className="eyebrow">Say hello</p><h1>Let&apos;s start a conversation.</h1><p className="lede">Have a thoughtful question, a project in mind, or simply want to share a response to something here? I&apos;d love to hear from you.</p></section><ContactForm /></div></main>;
}
