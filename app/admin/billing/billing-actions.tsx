"use client";

import { useState } from "react";

export function BillingActions({ plan, configured, monthlyPrice, hasCustomer }: { plan: string; configured: boolean; monthlyPrice: string; hasCustomer: boolean }) {
  const [message, setMessage] = useState("");
  async function open(endpoint: string, body?: object) {
    setMessage("Opening secure billing…");
    const response = await fetch(endpoint, { method: "POST", headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const result = await response.json();
    if (!response.ok || !result.url) return setMessage(result.error ?? "Billing could not be opened.");
    window.location.assign(result.url);
  }
  if (!configured) return <p className="form-error">Stripe is not configured yet. Free publishing remains fully available.</p>;
  return <div className="admin-actions">{plan === "free" && <button className="primary-button" onClick={() => open("/api/stripe/checkout", { priceId: monthlyPrice })}>Upgrade to Pro</button>}{hasCustomer && <button onClick={() => open("/api/stripe/portal")}>Manage subscription</button>}{message && <p role="status">{message}</p>}</div>;
}
