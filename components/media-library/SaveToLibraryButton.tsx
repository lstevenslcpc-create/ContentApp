"use client";

import { BookmarkPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import type { MediaLibraryAsset } from "@/lib/types";

type SavePayload = Partial<MediaLibraryAsset> & {
  title: string;
  asset_type: MediaLibraryAsset["asset_type"];
};

export function SaveToLibraryButton({ payload, label = "Save to Library" }: { payload: SavePayload; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setLoading(true);
    setMessage("");
    const response = await authedFetch("/api/media-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);
    setMessage(response.ok ? "Saved to library." : data.error || "Unable to save.");
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button className="btn-secondary" onClick={save} disabled={loading} type="button">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <BookmarkPlus size={16} />}
        {label}
      </button>
      {message && <span className="text-xs font-semibold text-slate-500">{message}</span>}
    </span>
  );
}
