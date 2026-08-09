import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Studio sign in", description: "Owner sign in for Ling Studio." };

export default function LoginPage() {
  return <main className="login-page"><p className="eyebrow">Ling Studio</p><h1>Welcome back.</h1><p className="lede">Sign in with the owner account to publish and manage content.</p><Suspense><LoginForm /></Suspense></main>;
}
