"use client";

import { useState } from "react";
import { authedFetch } from "@/lib/apiClient";

export function ScheduleControl({ contentId }: { contentId: string }) {
  const [message, setMessage] = useState("");

  async function schedule(formData: FormData) {
    const response = await authedFetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId, scheduledFor: formData.get("scheduledFor") })
    });
    const data = await response.json();
    setMessage(response.ok ? "Scheduled." : data.error || "Unable to schedule.");
    if (response.ok) window.location.reload();
  }

  return (
    <form action={schedule} className="mt-3 flex flex-wrap items-center gap-2">
      <input className="field max-w-56" type="datetime-local" name="scheduledFor" required />
      <button className="btn-secondary">Schedule</button>
      {message && <span className="text-xs font-semibold text-slate-500">{message}</span>}
    </form>
  );
}
