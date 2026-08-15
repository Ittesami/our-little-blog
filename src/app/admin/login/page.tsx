"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Incorrect password");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-5 py-24">
      <span className="text-4xl">🔒</span>
      <h1 className="mt-3 font-heading text-3xl text-pink-dark">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-pink-dark"
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-pink-dark px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
