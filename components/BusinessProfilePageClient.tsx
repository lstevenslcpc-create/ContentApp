"use client";

import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import { BusinessProfileForm } from "./BusinessProfileForm";

export function BusinessProfilePageClient() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authedFetch("/api/business-profile")
      .then(async (response) => {
        const data = await response.json();
        if (!active) return;
        if (!response.ok) setError(data.error || "Unable to load profile.");
        else setProfile(data.profile);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="rounded-xl bg-white p-6 text-slate-500">Loading profile...</div>;

  return (
    <>
      {error && <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p>}
      <BusinessProfileForm initial={profile} />
    </>
  );
}
