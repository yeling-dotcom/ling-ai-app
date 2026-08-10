import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicOrganization } from "@/lib/organization";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const senderName = typeof body.sender_name === "string" ? body.sender_name.trim() : "";
  const senderEmail = typeof body.sender_email === "string" ? body.sender_email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const errors: Record<string, string> = {};

  if (senderName.length < 2) errors.sender_name = "Please enter your name.";
  if (!emailPattern.test(senderEmail)) errors.sender_email = "Please enter a valid email address.";
  if (message.length < 10) errors.message = "Please write at least 10 characters.";
  if (senderName.length > 100 || senderEmail.length > 254 || message.length > 5000) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const supabase = await createClient();
  const requestedSlug = typeof body.organization_slug === "string" ? body.organization_slug : undefined;
  const publicOrganization = await getPublicOrganization(requestedSlug);
  if (publicOrganization && !publicOrganization.settings.contact_enabled) {
    return NextResponse.json({ error: "Contact is not enabled for this site." }, { status: 404 });
  }
  const { error } = await supabase.from("contact_messages").insert({
    organization_id: publicOrganization?.organization.id ?? null,
    sender_name: senderName,
    sender_email: senderEmail,
    message,
  });

  if (error) {
    console.error("Contact insert failed", error.code);
    return NextResponse.json({ error: "Your message could not be sent. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
