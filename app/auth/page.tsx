import { AuthPanel } from "@/components/AuthPanel";

export default function AuthPage() {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-[#f8f3ea] p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#172a3a]">Workspace Access</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f766f]">Sign in or create an account to save your Brand Brain, generated content, media jobs, schedules, and integrations.</p>
      </div>
      <div className="mt-5" />
      <AuthPanel />
    </div>
  );
}
