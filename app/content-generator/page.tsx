import { ContentGeneratorForm } from "@/components/ContentGeneratorForm";

export default function ContentGeneratorPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Content Generator</h1>
        <p className="mt-2 text-sm text-slate-600">Create platform-specific posts with approval, copy, Canva-ready visuals, and manual posting controls.</p>
      </div>
      <ContentGeneratorForm />
    </div>
  );
}
