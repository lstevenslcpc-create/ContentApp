"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Plus, Save, Sparkles } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import type { CalendarPlanStatus, ContentCalendarFocus, ContentCalendarPlan, ContentPack } from "@/lib/types";

const campaignLabels = [
  "teen anxiety",
  "burnout",
  "anxious attachment",
  "therapy education",
  "workbook promotion",
  "free lead magnet",
  "mental health product promo"
];

const seasonalPrompts = [
  "Mental Health Awareness Month",
  "Suicide Prevention Month",
  "Back-to-school",
  "New Year reset",
  "Mother's Day",
  "Father's Day",
  "finals week",
  "holiday stress"
];

const statuses: CalendarPlanStatus[] = ["idea", "draft", "needs_review", "approved", "scheduled", "posted"];

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
}

function monthDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function weekDays(anchor: Date) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: `Server returned a non-JSON response (${response.status}).` };
  }
}

export function ContentCalendarClient() {
  const [view, setView] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [plans, setPlans] = useState<ContentCalendarPlan[]>([]);
  const [focuses, setFocuses] = useState<ContentCalendarFocus[]>([]);
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [selectedPackId, setSelectedPackId] = useState("");
  const [campaignLabel, setCampaignLabel] = useState(campaignLabels[0]);
  const [seasonalPrompt, setSeasonalPrompt] = useState("");
  const [status, setStatus] = useState<CalendarPlanStatus>("idea");
  const [notes, setNotes] = useState("");
  const [weekFocus, setWeekFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  const visibleDays = useMemo(() => view === "month" ? monthDays(anchor) : weekDays(anchor), [anchor, view]);
  const rangeStart = dateKey(visibleDays[0]);
  const rangeEnd = dateKey(visibleDays[visibleDays.length - 1]);
  const currentWeekStart = dateKey(startOfWeek(new Date(`${selectedDate}T12:00:00`)));

  const plansByDate = useMemo(() => plans.reduce<Record<string, ContentCalendarPlan[]>>((accumulator, plan) => {
    accumulator[plan.planned_date] = accumulator[plan.planned_date] || [];
    accumulator[plan.planned_date].push(plan);
    return accumulator;
  }, {}), [plans]);

  useEffect(() => {
    const focus = focuses.find((item) => item.week_start === currentWeekStart);
    setWeekFocus(focus?.focus || "");
  }, [currentWeekStart, focuses]);

  async function loadCalendar() {
    setLoading(true);
    setMessage("");
    const response = await authedFetch(`/api/content-calendar?from=${rangeStart}&to=${rangeEnd}`);
    const data = await readApiResponse(response);
    setLoading(false);
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to load content calendar.");
      return;
    }
    setPacks(Array.isArray(data.packs) ? data.packs as ContentPack[] : []);
    setPlans(Array.isArray(data.plans) ? data.plans as ContentCalendarPlan[] : []);
    setFocuses(Array.isArray(data.focuses) ? data.focuses as ContentCalendarFocus[] : []);
    const warnings = Array.isArray(data.warnings) ? data.warnings.map(String).filter(Boolean) : [];
    if (warnings.length) setMessage(warnings.join(" "));
  }

  useEffect(() => {
    void loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  async function saveFocus() {
    setSaving("focus");
    setMessage("");
    const response = await authedFetch("/api/content-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "focus", weekStart: currentWeekStart, focus: weekFocus })
    });
    const data = await readApiResponse(response);
    setSaving("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to save this week's focus.");
      return;
    }
    setFocuses((current) => [data.focus as ContentCalendarFocus, ...current.filter((item) => item.week_start !== currentWeekStart)]);
    setMessage("This week's focus was saved.");
  }

  async function addPlan() {
    setSaving("plan");
    setMessage("");
    const response = await authedFetch("/api/content-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentPackId: selectedPackId,
        plannedDate: selectedDate,
        status,
        campaignLabel,
        focusLabel: weekFocus,
        seasonalPrompt,
        notes
      })
    });
    const data = await readApiResponse(response);
    setSaving("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to add content pack to the calendar.");
      return;
    }
    setPlans((current) => [data.plan as ContentCalendarPlan, ...current]);
    setNotes("");
    setMessage("Content pack added to the calendar.");
  }

  async function updateStatus(planId: string, nextStatus: CalendarPlanStatus) {
    setSaving(planId);
    const response = await authedFetch("/api/content-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", planId, status: nextStatus })
    });
    const data = await readApiResponse(response);
    setSaving("");
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Unable to update status.");
      return;
    }
    setPlans((current) => current.map((plan) => plan.id === planId ? data.plan as ContentCalendarPlan : plan));
  }

  const title = view === "month"
    ? anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : `${visibleDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${visibleDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-6 text-[#20313f]">
      <section className="overflow-hidden rounded-3xl bg-[#172a3a] p-6 text-white shadow-premium">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#eadfc8]">
              <CalendarDays size={14} />
              Content Calendar Planner
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Plan the week by campaign, service focus, and seasonal moment.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f3ecdf]">Assign saved content packs to dates, shape campaigns around LionHeart priorities, and keep every item in review before scheduling or posting.</p>
          </div>
          <div className="flex rounded-2xl bg-white/10 p-1">
            {(["month", "week"] as const).map((option) => (
              <button key={option} className={`rounded-xl px-4 py-2 text-sm font-bold capitalize ${view === option ? "bg-white text-[#172a3a]" : "text-[#f3ecdf]"}`} onClick={() => setView(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-[#e9dfcf] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">This week&apos;s focus</p>
              <h2 className="mt-1 text-xl font-bold text-[#172a3a]">{new Date(`${currentWeekStart}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric" })} week</h2>
            </div>
            <button className="btn-primary bg-[#172a3a] hover:bg-[#22384a]" onClick={saveFocus} disabled={Boolean(saving)}>
              {saving === "focus" ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Focus
            </button>
          </div>
          <textarea
            className="mt-4 min-h-24 w-full rounded-2xl border border-[#e6ddcf] bg-[#fffdf8] p-4 text-sm leading-6 outline-none focus:border-[#b89b5e] focus:ring-4 focus:ring-[#eadfc8]"
            value={weekFocus}
            onChange={(event) => setWeekFocus(event.target.value)}
            placeholder="Example: anxious attachment education, therapy consults, workbook promo, back-to-school support..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {[...campaignLabels, ...seasonalPrompts.slice(0, 4)].map((prompt) => (
              <button key={prompt} className="rounded-full bg-[#f7f1e6] px-3 py-1.5 text-xs font-bold text-[#77633c]" onClick={() => setWeekFocus(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e9dfcf] bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#77633c]">Planner prompts</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {seasonalPrompts.map((prompt) => (
              <button key={prompt} className={`rounded-full px-3 py-1.5 text-xs font-bold ${seasonalPrompt === prompt ? "bg-[#172a3a] text-white" : "bg-[#eef3ec] text-[#4f6f5a]"}`} onClick={() => setSeasonalPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-[#e9dfcf] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button className="btn-secondary px-3" onClick={() => setAnchor(addDays(anchor, view === "month" ? -30 : -7))}><ChevronLeft size={16} /></button>
            <h2 className="text-xl font-bold text-[#172a3a]">{title}</h2>
            <button className="btn-secondary px-3" onClick={() => setAnchor(addDays(anchor, view === "month" ? 30 : 7))}><ChevronRight size={16} /></button>
          </div>

          {loading ? (
            <div className="grid min-h-80 place-items-center text-sm font-bold text-[#6f766f]"><Loader2 className="mr-2 inline animate-spin" />Loading calendar...</div>
          ) : (
            <div className={`grid gap-2 ${view === "month" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-7" : "grid-cols-1 lg:grid-cols-7"}`}>
              {visibleDays.map((day) => {
                const key = dateKey(day);
                const dayPlans = plansByDate[key] || [];
                const muted = day.getMonth() !== anchor.getMonth() && view === "month";
                return (
                  <button
                    key={key}
                    className={`min-h-44 rounded-2xl border p-3 text-left transition ${selectedDate === key ? "border-[#b89b5e] bg-[#fff8e8] ring-4 ring-[#eadfc8]" : "border-[#eadfc8] bg-[#fffdf8] hover:border-[#d8c28a]"} ${muted ? "opacity-55" : ""}`}
                    onClick={() => setSelectedDate(key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#77633c]">{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
                      <span className="text-lg font-bold text-[#172a3a]">{day.getDate()}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {dayPlans.slice(0, 3).map((plan) => <PlanMini key={plan.id} plan={plan} />)}
                      {dayPlans.length > 3 && <p className="text-xs font-bold text-[#77633c]">+{dayPlans.length - 3} more</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#eee8fb] px-3 py-1 text-xs font-bold text-[#4d3a7a]"><Plus size={14} /> Add to calendar</p>
            <h3 className="mt-3 text-xl font-bold text-[#172a3a]">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>

            <label className="mt-4 block">
              <span className="label">Saved content pack</span>
              <select className="field mt-1" value={selectedPackId} onChange={(event) => setSelectedPackId(event.target.value)}>
                <option value="">Choose a pack</option>
                {packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.title}</option>)}
              </select>
            </label>

            <label className="mt-3 block">
              <span className="label">Campaign/focus label</span>
              <select className="field mt-1" value={campaignLabel} onChange={(event) => setCampaignLabel(event.target.value)}>
                {campaignLabels.map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>

            <label className="mt-3 block">
              <span className="label">Status</span>
              <select className="field mt-1" value={status} onChange={(event) => setStatus(event.target.value as CalendarPlanStatus)}>
                {statuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <label className="mt-3 block">
              <span className="label">Seasonal/holiday prompt</span>
              <select className="field mt-1" value={seasonalPrompt} onChange={(event) => setSeasonalPrompt(event.target.value)}>
                <option value="">None</option>
                {seasonalPrompts.map((prompt) => <option key={prompt}>{prompt}</option>)}
              </select>
            </label>

            <label className="mt-3 block">
              <span className="label">Notes</span>
              <textarea className="field mt-1 min-h-20" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Canva template, launch note, awareness angle..." />
            </label>

            <button className="btn-primary mt-4 w-full bg-[#172a3a] py-3 hover:bg-[#22384a]" onClick={addPlan} disabled={Boolean(saving)}>
              {saving === "plan" ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Add Content Pack
            </button>
            {!packs.length && <p className="mt-3 text-xs leading-5 text-[#8a6926]">Create and save a Content Pack first, then assign it to campaign dates here.</p>}
          </section>

          <section className="rounded-3xl border border-[#e9dfcf] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#172a3a]">Selected Day</h3>
            <div className="mt-4 space-y-3">
              {(plansByDate[selectedDate] || []).length ? plansByDate[selectedDate].map((plan) => (
                <PlanCard key={plan.id} plan={plan} saving={saving === plan.id} onStatus={updateStatus} />
              )) : (
                <p className="rounded-2xl border border-dashed border-[#eadfc8] bg-[#fffdf8] p-4 text-sm text-[#6f766f]">No content packs assigned to this date yet.</p>
              )}
            </div>
          </section>
        </aside>
      </section>

      {message && <p className="rounded-2xl bg-[#eef3ec] p-4 text-sm font-semibold text-[#4f6f5a]">{message}</p>}
    </div>
  );
}

function PlanMini({ plan }: { plan: ContentCalendarPlan }) {
  return (
    <div className="rounded-xl bg-white p-2 ring-1 ring-[#eadfc8]">
      <p className="line-clamp-2 text-xs font-bold leading-4 text-[#172a3a]">{plan.content_pack?.title || "Content pack"}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <StatusBadge status={plan.status} />
        {plan.campaign_label && <span className="rounded-full bg-[#eef3ec] px-2 py-0.5 text-[10px] font-bold text-[#4f6f5a]">{plan.campaign_label}</span>}
      </div>
    </div>
  );
}

function PlanCard({ plan, saving, onStatus }: { plan: ContentCalendarPlan; saving: boolean; onStatus: (id: string, status: CalendarPlanStatus) => void }) {
  return (
    <article className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StatusBadge status={plan.status} />
          <h4 className="mt-3 text-sm font-bold leading-5 text-[#172a3a]">{plan.content_pack?.title || "Content pack"}</h4>
        </div>
        {plan.content_pack_id && <Link className="text-xs font-bold text-[#4d3a7a]" href={`/content-packs/${plan.content_pack_id}`}>Open</Link>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[plan.campaign_label, plan.seasonal_prompt].filter(Boolean).map((label) => <span key={label} className="rounded-full bg-[#f7f1e6] px-2 py-1 text-[11px] font-bold text-[#77633c]">{label}</span>)}
      </div>
      {plan.notes && <p className="mt-3 text-xs leading-5 text-[#6f766f]">{plan.notes}</p>}
      <select className="field mt-3" value={plan.status} onChange={(event) => onStatus(plan.id, event.target.value as CalendarPlanStatus)} disabled={saving}>
        {statuses.map((item) => <option key={item}>{item}</option>)}
      </select>
    </article>
  );
}

function StatusBadge({ status }: { status: CalendarPlanStatus }) {
  const styles: Record<string, string> = {
    idea: "bg-[#eee8fb] text-[#4d3a7a]",
    draft: "bg-[#f7f1e6] text-[#77633c]",
    needs_review: "bg-[#fff4d8] text-[#8a6926]",
    approved: "bg-[#eef3ec] text-[#4f6f5a]",
    scheduled: "bg-blue-50 text-blue-700",
    posted: "bg-emerald-50 text-emerald-700",
    failed: "bg-rose-50 text-rose-700"
  };

  return <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.idea}`}>{status.replace("_", " ")}</span>;
}
