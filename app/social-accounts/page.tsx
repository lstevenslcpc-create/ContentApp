import { Instagram, Linkedin, Music2, PlaySquare, Facebook } from "lucide-react";
import { PrepareIntegrationButton } from "@/components/PrepareIntegrationButton";

const accounts = [
  { platform: "Instagram", provider: "instagram", icon: Instagram },
  { platform: "Facebook", provider: "facebook", icon: Facebook },
  { platform: "TikTok", provider: "tiktok", icon: Music2 },
  { platform: "LinkedIn", provider: "linkedin", icon: Linkedin },
  { platform: "YouTube Shorts", provider: "youtube", icon: PlaySquare },
  { platform: "Canva", provider: "canva", icon: PlaySquare }
];

export default function SocialAccountsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Social Accounts</h1>
        <p className="mt-2 text-sm text-slate-600">OAuth posting integration is prepared for a future phase. No fake live connections are shown.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map(({ platform, provider, icon: Icon }) => (
          <article key={platform} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-brand"><Icon size={21} /></span>
              <div>
                <h2 className="font-bold text-ink">{platform}</h2>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Not Connected</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">OAuth posting integration prepared for future phase.</p>
            <PrepareIntegrationButton provider={provider} />
          </article>
        ))}
      </div>
    </div>
  );
}
