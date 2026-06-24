"use client";

import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import type { ContentCalendarPlan, ContentPack } from "@/lib/types";

export type WorkflowStepId =
  | "generated"
  | "content_pack_created"
  | "approved"
  | "canva_copy_prepared"
  | "designed_in_canva"
  | "scheduled"
  | "ready_to_post"
  | "posted";

type WorkflowStep = {
  id: WorkflowStepId;
  label: string;
  done: boolean;
};

function metadataString(pack: ContentPack, key: string) {
  return pack.metadata && typeof pack.metadata[key] === "string" ? String(pack.metadata[key]) : "";
}

function metadataRecord(pack: ContentPack, key: string) {
  const value = pack.metadata?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function getWorkflowDesignStatus(pack: ContentPack) {
  const metadataStatus = metadataString(pack, "canvaPrepStatus");
  if (metadataStatus && (!pack.design_status || pack.design_status === "not_started")) return metadataStatus;
  return pack.design_status || metadataStatus || "not_started";
}

export function isWorkflowApproved(pack: ContentPack) {
  return ["approved", "scheduled", "posted"].includes(pack.status) || metadataString(pack, "manualPostingStatus") === "posted";
}

export function isWorkflowCanvaPrepared(pack: ContentPack) {
  const designStatus = getWorkflowDesignStatus(pack);
  return (
    ["ready_for_canva", "design_started", "designed_in_canva"].includes(designStatus) ||
    Boolean(pack.canva_template_id) ||
    Boolean(metadataString(pack, "selectedCanvaTemplateId")) ||
    Object.keys(metadataRecord(pack, "canvaFillPackage")).length > 0
  );
}

export function isWorkflowDesigned(pack: ContentPack) {
  return getWorkflowDesignStatus(pack) === "designed_in_canva";
}

export function isWorkflowScheduled(pack: ContentPack, plans: ContentCalendarPlan[] = []) {
  return (
    pack.status === "scheduled" ||
    pack.status === "posted" ||
    Boolean(metadataString(pack, "manualPostingScheduledDate")) ||
    plans.some((plan) => plan.content_pack_id === pack.id)
  );
}

export function isWorkflowPosted(pack: ContentPack) {
  return pack.status === "posted" || metadataString(pack, "manualPostingStatus") === "posted";
}

export function isWorkflowReadyToPost(pack: ContentPack, plans: ContentCalendarPlan[] = []) {
  return (
    isWorkflowApproved(pack) &&
    isWorkflowCanvaPrepared(pack) &&
    isWorkflowDesigned(pack) &&
    isWorkflowScheduled(pack, plans) &&
    !isWorkflowPosted(pack) &&
    metadataString(pack, "manualPostingStatus") !== "failed"
  );
}

export function getWorkflowMissingReasons(pack: ContentPack, plans: ContentCalendarPlan[] = []) {
  const reasons: string[] = [];
  if (!isWorkflowApproved(pack)) reasons.push("Not approved yet");
  if (!isWorkflowCanvaPrepared(pack)) reasons.push("Canva copy not prepared yet");
  if (!isWorkflowDesigned(pack)) reasons.push("Not marked designed yet");
  if (!isWorkflowScheduled(pack, plans)) reasons.push("Not scheduled yet");
  if (isWorkflowPosted(pack)) reasons.push("Already posted");
  if (metadataString(pack, "manualPostingStatus") === "failed") reasons.push("Marked failed");
  return reasons;
}

export function getWorkflowSteps(pack: ContentPack, plans: ContentCalendarPlan[] = []): WorkflowStep[] {
  return [
    { id: "generated", label: "Generated", done: true },
    { id: "content_pack_created", label: "Content Pack Created", done: Boolean(pack.id) },
    { id: "approved", label: "Approved", done: isWorkflowApproved(pack) },
    { id: "canva_copy_prepared", label: "Canva Copy Prepared", done: isWorkflowCanvaPrepared(pack) },
    { id: "designed_in_canva", label: "Designed in Canva", done: isWorkflowDesigned(pack) },
    { id: "scheduled", label: "Scheduled", done: isWorkflowScheduled(pack, plans) },
    { id: "ready_to_post", label: "Ready to Post", done: isWorkflowReadyToPost(pack, plans) || isWorkflowPosted(pack) },
    { id: "posted", label: "Posted", done: isWorkflowPosted(pack) }
  ];
}

export function WorkflowStatusBar({
  pack,
  plans = [],
  compact = false
}: {
  pack: ContentPack;
  plans?: ContentCalendarPlan[];
  compact?: boolean;
}) {
  const steps = getWorkflowSteps(pack, plans);
  const firstMissingIndex = steps.findIndex((step) => !step.done);
  const currentIndex = firstMissingIndex === -1 ? steps.length - 1 : firstMissingIndex;

  return (
    <div className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Workflow Status</p>
        <span className="rounded-full bg-[#eef3ec] px-3 py-1 text-[11px] font-bold text-[#4f6f5a]">
          {steps[currentIndex]?.done && currentIndex === steps.length - 1 ? "Complete" : `Current: ${steps[currentIndex]?.label || "Review"}`}
        </span>
      </div>
      <div className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 md:grid-cols-4 xl:grid-cols-8"}`}>
        {steps.map((step, index) => {
          const state = step.done ? "completed" : index === currentIndex ? "current" : "missing";
          return (
            <div
              key={step.id}
              className={`rounded-xl p-3 ring-1 ${
                state === "completed"
                  ? "bg-[#eef3ec] text-[#4f6f5a] ring-[#cbdcc7]"
                  : state === "current"
                    ? "bg-[#eee8fb] text-[#4d3a7a] ring-[#d8cef3]"
                    : "bg-white text-[#879087] ring-[#eadfc8]"
              }`}
            >
              <div className="flex items-center gap-2">
                {state === "completed" ? <CheckCircle2 size={16} /> : state === "current" ? <CircleDot size={16} /> : <Circle size={16} />}
                <span className="text-[11px] font-bold uppercase tracking-wide">{state === "completed" ? "Done" : state === "current" ? "Current" : "Missing"}</span>
              </div>
              <p className="mt-2 text-xs font-bold leading-4">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
