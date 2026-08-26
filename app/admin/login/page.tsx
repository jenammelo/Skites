"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't sign in.");
        return;
      }
      router.push("/admin/events");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <p className="text-xs font-semibold uppercase tracking-tight2 text-muted">Platform admin</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight2">Enter admin password</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Password"
        className="touch mt-6 w-full rounded border border-line bg-white px-4 text-[15px] outline-none focus:border-ink"
        autoFocus
      />
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <Button className="mt-6" fullWidth onClick={submit} disabled={loading}>
        {loading ? "Checking…" : "Continue"}
      </Button>
    </div>
  );
}
