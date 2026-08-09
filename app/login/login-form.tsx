"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (signInError) { setError("Email or password is incorrect."); setLoading(false); return; }
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin/posts");
    router.refresh();
  }

  return <form className="contact-form login-form" onSubmit={submit}>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    <button className="primary-button" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>;
}
