"use client";

import { FormEvent, useState } from "react";

type Fields = "sender_name" | "sender_email" | "message";

export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      sender_name: String(data.get("sender_name") ?? "").trim(),
      sender_email: String(data.get("sender_email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    const nextErrors: Partial<Record<Fields, string>> = {};
    if (values.sender_name.length < 2) nextErrors.sender_name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.sender_email)) nextErrors.sender_email = "Please enter a valid email.";
    if (values.message.length < 10) nextErrors.message = "Please write at least 10 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setState("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) setErrors(result.errors);
        throw new Error(result.error);
      }
      form.reset();
      setErrors({});
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return <div className="success-card" role="status"><span>✓</span><h2>Message received.</h2><p>Thank you for writing. I&apos;ll get back to you soon.</p><button onClick={() => setState("idle")}>Send another</button></div>;
  }

  return <form className="contact-form" onSubmit={submit} noValidate>
    <label>Name<input name="sender_name" autoComplete="name" aria-invalid={!!errors.sender_name} /><small>{errors.sender_name}</small></label>
    <label>Email<input name="sender_email" type="email" autoComplete="email" aria-invalid={!!errors.sender_email} /><small>{errors.sender_email}</small></label>
    <label>Message<textarea name="message" rows={7} aria-invalid={!!errors.message} /><small>{errors.message}</small></label>
    <button className="primary-button" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message →"}</button>
    {state === "error" && <p className="form-error" role="alert">Something went wrong. Please try again.</p>}
  </form>;
}
