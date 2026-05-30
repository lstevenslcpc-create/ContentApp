"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import type { GeneratedContent, MediaProviderResponse } from "@/lib/types";
import { useContentItems } from "./useContentItems";
import { SaveToLibraryButton } from "./media-library/SaveToLibraryButton";

export function MediaGeneratorPanel({ content, provider }: { content: GeneratedContent[]; provider: string }) {
  const searchParams = useSearchParams();
  const initialContentId = searchParams.get("contentId") || "";
  const { items } = useContentItems();
  const contentOptions = items.length ? items : content;
  const [result, setResult] = useState<MediaProviderResponse | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastMediaType, setLastMediaType] = useState<"image" | "video">("image");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setResult(null);
    const selected = contentOptions.find((item) => item.id === formData.get("contentId"));
    const prompt = String(formData.get("prompt") || selected?.visual_idea || selected?.hook || "");
    const mediaType = formData.get("mediaType") === "video" ? "video" : "image";
    setLastPrompt(prompt);
    setLastMediaType(mediaType);
    const response = await authedFetch("/api/media/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId: formData.get("contentId") || undefined,
        prompt,
        mediaType,
        aspectRatio: formData.get("aspectRatio"),
        style: formData.get("style")
      })
    });
    setResult(await response.json());
    setLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form action={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">Current provider: {provider}</div>
        <div className="grid gap-4">
          <label><span className="label">Content selector</span><select className="field mt-1" name="contentId" defaultValue={initialContentId}><option value="">No linked post</option>{contentOptions.map((item) => <option key={item.id} value={item.id}>{item.platform} · {item.hook?.slice(0, 70)}</option>)}</select></label>
          <label><span className="label">Prompt</span><textarea className="field mt-1 min-h-32" name="prompt" placeholder="Describe the image or video you want..." /></label>
          <label><span className="label">Media type</span><select className="field mt-1" name="mediaType"><option value="image">image</option><option value="video">video</option></select></label>
          <label><span className="label">Aspect ratio</span><select className="field mt-1" name="aspectRatio"><option>1:1</option><option>9:16</option><option>16:9</option></select></label>
          <label><span className="label">Style</span><select className="field mt-1" name="style">{["realistic","cinematic","luxury","clean","bold","social ad"].map((x) => <option key={x}>{x}</option>)}</select></label>
          <button className="btn-primary" disabled={loading}>{loading ? "Generating..." : "Generate Media"}</button>
        </div>
      </form>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Media preview</h2>
        {!result && <p className="mt-4 text-sm text-slate-500">Generated media, open links, and download links will appear here.</p>}
        {result?.error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{result.error}</p>}
        {result?.message && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-800">{result.message}</p>}
        {result?.mediaUrl && (
          <div className="mt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.mediaUrl} alt="Generated media" className="max-h-[560px] w-full rounded-xl object-contain ring-1 ring-slate-200" />
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={result.mediaUrl} target="_blank" className="btn-secondary">Open</a>
              <a href={result.mediaUrl} download className="btn-secondary">Download</a>
              <SaveToLibraryButton
                payload={{
                  title: `${lastMediaType === "video" ? "Video" : "Image"} from AI Media Generator`,
                  asset_type: lastMediaType,
                  source: "ai_media_generator",
                  media_url: result.mediaUrl,
                  thumbnail_url: result.mediaUrl,
                  prompt: lastPrompt,
                  tags: [lastMediaType, result.provider],
                  status: "saved"
                }}
                label="Save to Library"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
