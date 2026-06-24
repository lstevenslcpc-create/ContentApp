"use client";

import type React from "react";
import { Archive, Copy, Download, ExternalLink, FolderPlus, Image as ImageIcon, Loader2, Palette, Search, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { authedFetch } from "@/lib/apiClient";
import type { MediaLibraryAsset, MediaLibraryStatus } from "@/lib/types";

const assetTypes = ["all", "image", "video", "caption", "carousel", "blog outline", "Pinterest pin", "TikTok script", "email", "Canva direction", "product promo", "therapy service promo"];
const statuses = ["all", "draft", "saved", "approved", "used", "archived"];
const platforms = ["all", "Instagram", "TikTok", "Pinterest", "blog", "email", "YouTube Shorts", "Threads", "Multi-platform"];

export function MediaLibraryClient() {
  const [assets, setAssets] = useState<MediaLibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    assetType: "all",
    platform: "all",
    pillar: "",
    product: "",
    service: "",
    status: "all",
    date: "",
    search: ""
  });

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setLoading(true);
    const response = await authedFetch("/api/media-library");
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to load media library.");
      return;
    }
    setAssets(data.assets || []);
  }

  const filteredAssets = useMemo(() => {
    const search = filters.search.toLowerCase().trim();
    return assets.filter((asset) => {
      const createdDate = asset.created_at?.slice(0, 10) || "";
      const searchable = [asset.title, asset.description, asset.text_content, asset.prompt, asset.platform, asset.content_pillar, asset.product_tie_in, asset.service_tie_in, ...(asset.tags || [])].filter(Boolean).join(" ").toLowerCase();

      return (
        (filters.assetType === "all" || asset.asset_type === filters.assetType) &&
        (filters.platform === "all" || asset.platform === filters.platform) &&
        (!filters.pillar || asset.content_pillar?.toLowerCase().includes(filters.pillar.toLowerCase())) &&
        (!filters.product || asset.product_tie_in?.toLowerCase().includes(filters.product.toLowerCase())) &&
        (!filters.service || asset.service_tie_in?.toLowerCase().includes(filters.service.toLowerCase())) &&
        (filters.status === "all" || asset.status === filters.status) &&
        (!filters.date || createdDate === filters.date) &&
        (!search || searchable.includes(search))
      );
    });
  }, [assets, filters]);

  async function patchAsset(asset: MediaLibraryAsset, update: Partial<MediaLibraryAsset>, success: string) {
    const response = await authedFetch(`/api/media-library/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update)
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to update asset.");
      return;
    }
    setAssets((current) => current.map((item) => (item.id === asset.id ? data.asset : item)));
    setMessage(success);
  }

  async function deleteAsset(asset: MediaLibraryAsset) {
    const response = await authedFetch(`/api/media-library/${asset.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to delete asset.");
      return;
    }
    setAssets((current) => current.filter((item) => item.id !== asset.id));
    setMessage("Asset deleted.");
  }

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <Palette size={14} />
              Media Library
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">A calm creative home for every AI asset.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f3ecdf]">Browse generated images, videos, captions, Canva directions, scripts, emails, product promos, and therapy service assets from one polished library.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Assets" value={assets.length} />
            <Stat label="Visible" value={filteredAssets.length} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e9dfcf] bg-white/85 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9dfcf] text-[#172a3a]"><Search size={18} /></span>
          <div>
            <h2 className="text-xl font-bold text-[#172a3a]">Find assets</h2>
            <p className="mt-1 text-sm text-[#6f766f]">Filter by format, platform, tie-in, status, date, keyword, or tag.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input className="field border-[#e6ddcf] bg-[#fffdf8]" placeholder="Search keyword or tag..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
          <select className="field border-[#e6ddcf] bg-[#fffdf8]" value={filters.assetType} onChange={(event) => setFilters({ ...filters, assetType: event.target.value })}>{assetTypes.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="field border-[#e6ddcf] bg-[#fffdf8]" value={filters.platform} onChange={(event) => setFilters({ ...filters, platform: event.target.value })}>{platforms.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="field border-[#e6ddcf] bg-[#fffdf8]" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <input className="field border-[#e6ddcf] bg-[#fffdf8]" placeholder="Content pillar" value={filters.pillar} onChange={(event) => setFilters({ ...filters, pillar: event.target.value })} />
          <input className="field border-[#e6ddcf] bg-[#fffdf8]" placeholder="Product tie-in" value={filters.product} onChange={(event) => setFilters({ ...filters, product: event.target.value })} />
          <input className="field border-[#e6ddcf] bg-[#fffdf8]" placeholder="Service tie-in" value={filters.service} onChange={(event) => setFilters({ ...filters, service: event.target.value })} />
          <input className="field border-[#e6ddcf] bg-[#fffdf8]" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        </div>
        {message && <p className="mt-4 rounded-xl bg-[#eef3ec] p-3 text-sm font-semibold text-[#4f6f5a]">{message}</p>}
      </section>

      {loading && <div className="rounded-2xl bg-white p-8 text-center text-[#6f766f]">Loading media library...</div>}
      {!loading && !filteredAssets.length && (
        <div className="rounded-3xl border border-dashed border-[#d8c28a] bg-white/80 p-10 text-center shadow-sm">
          <ImageIcon className="mx-auto text-[#b89b5e]" size={38} />
          <h2 className="mt-4 text-2xl font-bold text-[#172a3a]">Your saved AI images, videos, posts, and Canva-ready assets will appear here.</h2>
          <p className="mt-2 text-sm text-[#6f766f]">Generate media, save captions, or collect intelligence ideas to start building your creative library.</p>
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPatch={(update, success) => patchAsset(asset, update, success)}
            onDelete={() => deleteAsset(asset)}
          />
        ))}
      </section>
    </div>
  );
}

function AssetCard({ asset, onPatch, onDelete }: { asset: MediaLibraryAsset; onPatch: (update: Partial<MediaLibraryAsset>, success: string) => void; onDelete: () => void }) {
  const isMedia = asset.asset_type === "image" || asset.asset_type === "video";
  const snippet = asset.text_content || asset.description || asset.prompt || "No text preview available.";

  async function copyText() {
    await navigator.clipboard.writeText(asset.text_content || asset.prompt || asset.media_url || "");
  }

  function downloadText() {
    const blob = new Blob([asset.text_content || asset.prompt || asset.media_url || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${asset.title || "media-library-asset"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-[#e9dfcf] bg-white shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center bg-[#f8f3ea]">
        {asset.asset_type === "image" && asset.media_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.thumbnail_url || asset.media_url} alt={asset.title || "Media asset"} className="h-full w-full object-cover" />
        ) : asset.asset_type === "video" && asset.media_url ? (
          <video src={asset.media_url} className="h-full w-full object-cover" controls />
        ) : (
          <div className="p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[#b89b5e]">{asset.asset_type}</p>
            <p className="mt-3 line-clamp-6 text-sm leading-6 text-[#20313f]">{snippet}</p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{asset.asset_type}</Badge>
          <StatusBadge status={asset.status} />
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug text-[#172a3a]">{asset.title || "Untitled asset"}</h3>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#7b7468]">{asset.source || "manual"} · {asset.platform || "No platform"} · {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "No date"}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5f675f]">{asset.description || asset.content_pillar || asset.prompt || "Saved creative asset."}</p>

        <div className="mt-4 grid gap-2 text-xs text-[#6f766f]">
          <Meta label="Pillar" value={asset.content_pillar} />
          <Meta label="Tie-in" value={[asset.product_tie_in, asset.service_tie_in].filter(Boolean).join(" · ")} />
        </div>

        {!!asset.tags?.length && (
          <div className="mt-4 flex flex-wrap gap-2">
            {asset.tags.map((tag) => <span key={tag} className="rounded-full bg-[#eef3ec] px-2.5 py-1 text-xs font-bold text-[#4f6f5a]">{tag}</span>)}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {asset.media_url && <a className="btn-secondary" href={asset.media_url} target="_blank"><ExternalLink size={16} />Open</a>}
          <button className="btn-secondary" onClick={copyText}><Copy size={16} />Copy text</button>
          {isMedia && asset.media_url ? <a className="btn-secondary" href={asset.media_url} download><Download size={16} />Download</a> : <button className="btn-secondary" onClick={downloadText}><Download size={16} />Download</button>}
          <button className="btn-secondary" onClick={() => onPatch({ metadata: { ...(asset.metadata || {}), campaignSavedAt: new Date().toISOString() } }, "Saved to campaign placeholder.")}><FolderPlus size={16} />Save to campaign</button>
          <button className="btn-secondary" onClick={() => onPatch({ metadata: { ...(asset.metadata || {}), canvaPrepRecordedAt: new Date().toISOString() } }, "Canva prep placeholder recorded.")}><Send size={16} />Prepare Canva Copy</button>
          <button className="btn-secondary" onClick={() => onPatch({ status: "used" }, "Marked as used.")}>Mark as used</button>
          <button className="btn-secondary" onClick={() => onPatch({ status: "archived" }, "Archived.")}><Archive size={16} />Archive</button>
          <button className="btn-secondary text-rose-700" onClick={onDelete}><Trash2 size={16} />Delete</button>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#eadfc8]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#f7f1e6] px-2.5 py-1 text-xs font-bold text-[#77633c]">{children}</span>;
}

function StatusBadge({ status }: { status: MediaLibraryStatus }) {
  const styles: Record<MediaLibraryStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    saved: "bg-[#eef3ec] text-[#4f6f5a]",
    approved: "bg-blue-50 text-blue-700",
    used: "bg-[#fff4d8] text-[#8a6926]",
    archived: "bg-slate-100 text-slate-500"
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{status}</span>;
}

function Meta({ label, value }: { label: string; value?: string | null }) {
  return (
    <p>
      <b>{label}:</b> {value || "None"}
    </p>
  );
}
