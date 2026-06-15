"use client";

import { useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import { CONTENT_GOAL_IDS } from "@/lib/contentGoalConfig";
import type { GeneratedContent } from "@/lib/types";
import { ContentCard } from "./ContentCard";

const MAX_BATCH_SIZE = 3;

export function ContentGeneratorForm() {
  const [posts, setPosts] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [progress, setProgress] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    setProgress("");
    setPosts([]);
    const topic = String(formData.get("topic") || "").trim();
    if (!topic) {
      setLoading(false);
      setError("Add a topic before generating content.");
      return;
    }

    const requestedPosts = Number(formData.get("numberOfPosts"));
    const payload = {
      topic,
      platform: formData.get("platform"),
      contentType: formData.get("contentType"),
      contentGoal: formData.get("contentGoal"),
      numberOfPosts: requestedPosts
    };

    const batchCount = Math.ceil(requestedPosts / MAX_BATCH_SIZE);
    const combinedPosts: GeneratedContent[] = [];
    const warnings: string[] = [];

    try {
      for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
        const angleOffset = batchIndex * MAX_BATCH_SIZE;
        const batchSize = Math.min(MAX_BATCH_SIZE, requestedPosts - angleOffset);
        setProgress(batchCount > 1 ? `Generating batch ${batchIndex + 1} of ${batchCount}...` : "Generating content...");
        const response = await authedFetch("/api/content/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, numberOfPosts: batchSize, angleOffset })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Generation failed on batch ${batchIndex + 1}.`);
        }
        combinedPosts.push(...(data.posts || []));
        setPosts([...combinedPosts]);
        if (data.warning) warnings.push(data.warning);
      }
      setError(warnings.join(" "));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  const visiblePosts = posts.filter((post) => showArchived || !post.archived);

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form action={submit} className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4">
          <label><span className="label">Platform</span><select className="field mt-1" name="platform">{["TikTok","Instagram","Facebook","LinkedIn","YouTube Shorts"].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label><span className="label">Content type</span><select className="field mt-1" name="contentType">{["post","reel","short video","carousel","story","ad"].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label><span className="label">Topic</span><input className="field mt-1" name="topic" required placeholder="anxious attachment, people pleasing, teen anxiety..." /></label>
          <label><span className="label">Content goal</span><select className="field mt-1" name="contentGoal">{CONTENT_GOAL_IDS.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label><span className="label">Number of posts</span><select className="field mt-1" name="numberOfPosts">{[1,5,7,30].map((x) => <option key={x}>{x}</option>)}</select></label>
          <button className="btn-primary" disabled={loading}>{loading ? "Generating..." : "Generate Content"}</button>
          {progress && <p className="rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">{progress}</p>}
          {error && <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
          <p className="text-xs leading-5 text-slate-500">Canva workflow: generated visual ideas are written as Canva-ready creative directions. API-level Canva automation can be added in a future phase with official integration and templates.</p>
        </div>
      </form>
      <div className="space-y-4">
        {posts.length ? (
          <div className="flex justify-end">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
              Show Archived
            </label>
          </div>
        ) : null}
        {visiblePosts.length ? visiblePosts.map((post) => (
          <ContentCard
            key={post.id}
            item={post}
            onUpdate={(updated) => setPosts((current) => current.map((item) => item.id === updated.id ? updated : item))}
            onRemove={(id) => setPosts((current) => current.filter((item) => item.id !== id))}
          />
        )) : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Generated posts will appear here for review, approval, copying, scheduling, and manual posting.</div>}
      </div>
    </div>
  );
}
