"use client";

import { useState } from "react";
import { authedFetch } from "@/lib/apiClient";

const fields = [
  ["business_name", "Business name"],
  ["industry", "Industry/niche"],
  ["services_offered", "Services offered"],
  ["target_audience", "Target audience"],
  ["location_served", "Location served"],
  ["brand_voice", "Brand voice"],
  ["main_goal", "Main goal"],
  ["website_link", "Website link"],
  ["social_handles_text", "Social media handles"],
  ["offer_promotion", "Offer/promotion"],
  ["call_to_action", "Call-to-action"]
];

export function BusinessProfileForm({ initial }: { initial?: Record<string, unknown> | null }) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    setMessage("");
    const socialText = String(formData.get("social_handles_text") || "");
    const payload = Object.fromEntries(formData.entries());
    delete payload.social_handles_text;
    const social_handles = socialText
      .split("\n")
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) acc[key.trim()] = rest.join(":").trim();
        return acc;
      }, {});

    const response = await authedFetch("/api/business-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, social_handles })
    });
    const data = await response.json();
    setSaving(false);
    setMessage(response.ok ? "Business profile saved." : data.error || "Unable to save profile.");
  }

  const handles = initial?.social_handles && typeof initial.social_handles === "object"
    ? Object.entries(initial.social_handles as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join("\n")
    : "";

  return (
    <form action={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      {fields.map(([name, label]) => (
        <label key={name} className={name === "services_offered" || name === "target_audience" || name === "social_handles_text" ? "md:col-span-2" : ""}>
          <span className="label">{label}</span>
          {name === "services_offered" || name === "target_audience" || name === "social_handles_text" ? (
            <textarea className="field mt-1 min-h-24" name={name} defaultValue={name === "social_handles_text" ? handles : String(initial?.[name] || "")} />
          ) : (
            <input className="field mt-1" name={name} defaultValue={String(initial?.[name] || "")} required={name === "business_name"} />
          )}
        </label>
      ))}
      <div className="flex items-center gap-3 md:col-span-2">
        <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        {message && <p className="text-sm font-semibold text-slate-600">{message}</p>}
      </div>
    </form>
  );
}
