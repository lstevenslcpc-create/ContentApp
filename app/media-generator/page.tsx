import { Suspense } from "react";
import { MediaGeneratorPanel } from "@/components/MediaGeneratorPanel";

export default function MediaGeneratorPage() {
  const provider = process.env.MEDIA_PROVIDER || "fal";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Creative Studio</h1>
        <p className="mt-2 text-sm text-slate-600">Generate campaign visuals, ads, covers, product mockups, and social graphics with fal.ai by default. Video activates when FAL_VIDEO_MODEL is configured.</p>
      </div>
      <Suspense fallback={<div className="rounded-xl bg-white p-6">Loading generator...</div>}>
        <MediaGeneratorPanel content={[]} provider={provider} />
      </Suspense>
    </div>
  );
}
