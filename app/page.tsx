import Link from "next/link";
import { ArrowRight, Brain, FolderOpen, Search, Sparkles } from "lucide-react";
import { AuthPanel } from "@/components/AuthPanel";

const features = [
  {
    title: "Brand Brain",
    description: "Save LionHeart Therapy's voice, safety rules, audience profiles, services, products, and visual direction.",
    icon: Brain
  },
  {
    title: "Content Intelligence",
    description: "Find AI-assisted content opportunities based on SEO, audience pain points, and conversion tie-ins.",
    icon: Search
  },
  {
    title: "Creator Workflow",
    description: "Generate content, create AI media, approve drafts, schedule manually, and save assets to your library.",
    icon: Sparkles
  },
  {
    title: "Media Library",
    description: "Organize generated images, videos, captions, scripts, Canva directions, and campaign assets.",
    icon: FolderOpen
  }
];

export default function LandingPage() {
  return (
    <div className="rounded-[2rem] bg-[#f8f3ea] p-4 text-[#20313f] sm:p-6">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
            AI Content Creator OS
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Sign in to your calm, clinical content command center.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f3ecdf]">
            Built for LionHeart Therapy to plan, generate, review, organize, and manually publish AI-assisted marketing content without losing clinical nuance or brand warmth.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/workspace" className="btn-primary bg-[#c9b7ee] text-[#2f2550] hover:bg-[#bba5e8]">
              Open Daily Workspace
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth?next=/workspace" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-xs leading-5 text-[#d9d0c0]">
            AI-generated content should be reviewed before posting. Auto-posting remains disabled until official OAuth and approval gates are production-ready.
          </p>
        </div>

        <AuthPanel />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-2xl border border-[#e9dfcf] bg-white/85 p-5 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ec] text-[#4f6f5a]">
                <Icon size={19} />
              </span>
              <h2 className="mt-4 text-lg font-bold text-[#172a3a]">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6f766f]">{feature.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
