"use client";

import { useState } from "react";
import { Archive, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";

export function ContentLifecycleActions({
  archived,
  busy,
  onArchive,
  onRestore,
  onDelete
}: {
  archived?: boolean;
  busy?: boolean;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <details className="relative">
        <summary className="btn-secondary list-none px-3 [&::-webkit-details-marker]:hidden">
          <MoreHorizontal size={16} />
          More actions
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-[#eadfc8] bg-white p-2 shadow-premium">
          {archived ? (
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-[#4f6f5a] hover:bg-[#eef3ec]" type="button" disabled={busy} onClick={onRestore}>
              <RotateCcw size={15} />
              Restore
            </button>
          ) : (
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-[#6f766f] hover:bg-[#f8f5ee]" type="button" disabled={busy} onClick={onArchive}>
              <Archive size={15} />
              Archive
            </button>
          )}
          <button className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-700 hover:bg-rose-50" type="button" disabled={busy} onClick={() => setConfirming(true)}>
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </details>

      {confirming ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#172a3a]/45 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium">
            <p className="text-lg font-bold text-[#172a3a]">Delete this content permanently? This cannot be undone.</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setConfirming(false)}>Cancel</button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-800"
                type="button"
                disabled={busy}
                onClick={() => {
                  setConfirming(false);
                  onDelete?.();
                }}
              >
                <Trash2 size={16} />
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
