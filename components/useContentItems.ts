"use client";

import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import type { GeneratedContent } from "@/lib/types";

export function useContentItems() {
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authedFetch("/api/content-calendar")
      .then(async (response) => {
        const data = await response.json();
        if (!active) return;
        if (!response.ok) setError(data.error || "Unable to load content.");
        else setItems(data.items || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load content.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { items, loading, error };
}
