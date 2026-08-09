"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Sign in failed."); return; }
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin/posts");
      router.refresh();
    } catch {
      setError("Sign in timed out. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return <form className="contact-form login-form" onSubmit={submit}>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    <button className="primary-button" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>;
}
