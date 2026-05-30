"use client";

import { useState } from "react";
import { authedFetch } from "@/lib/apiClient";

export function PrepareIntegrationButton({ provider }: { provider: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function prepare() {
    setLoading(true);
    setMessage("");
    const response = await authedFetch("/api/integrations/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider })
    });
    const data = await response.json();
    setLoading(false);
    setMessage(data.message || data.error || "Integration prepared.");
  }

  return (
    <div className="mt-4">
      <button className="btn-secondary" onClick={prepare} disabled={loading}>{loading ? "Preparing..." : "Prepare Integration"}</button>
      {message && <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{message}</p>}
    </div>
  );
}
