import { ContentPackPreviewClient } from "@/components/content-packs/ContentPackPreviewClient";

export default async function ContentPackPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="rounded-[2rem] bg-[#f8f3ea] p-3 sm:p-5">
      <ContentPackPreviewClient packId={id} />
    </div>
  );
}
