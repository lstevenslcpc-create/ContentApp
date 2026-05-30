"use client";

import { authedFetch } from "@/lib/apiClient";

export default function ClientStatusButtons({ id }: { id: string }) {
  async function setStatus(status: string) {
    await authedFetch("/api/content/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: id, status })
    });
    window.location.reload();
  }

  return (
    <>
      <button className="btn-secondary" onClick={() => setStatus("posted")}>Mark posted</button>
      <button className="btn-secondary" onClick={() => setStatus("failed")}>Mark failed</button>
    </>
  );
}
