import { ContentIntelligenceClient } from "@/components/content-intelligence/ContentIntelligenceClient";

export const dynamic = "force-dynamic";

export default function ContentIntelligencePage() {
  return (
    <div className="rounded-[2rem] bg-[#f8f3ea] p-3 sm:p-5">
      <ContentIntelligenceClient />
    </div>
  );
}
