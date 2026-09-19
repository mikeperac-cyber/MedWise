/**
 * Doz Kokpiti page: today's doses, adherence, hydration and PRN logging.
 *
 * The seeded demo data is gone. The previous build shipped a hardcoded
 * `streak: 14` and 2100ml of hydration, so a brand-new visitor was shown a
 * fortnight of adherence they had never earned. A new user now starts at zero
 * and sees an empty state that explains what to do.
 */

import type { RegimenItem } from "../types/index.ts";
import { state } from "../state.ts";
import { motivationalQuotes } from "../constants/quotes.ts";
import { calculateAdherence } from "../utils/clinical.ts";
import { saveRegimen, saveHydration, evaluateDailyStreak } from "../services/storage.ts";
import { byId, showToast, closeCustomDoseModal } from "../shell/shell.ts";

const HYDRATION_CEILING_ML = 4000;

export function updateDateDisplay(): void {
  const el = byId("current-date-display");
  if (!el) return;
  el.textContent = `Bugün, ${new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function rotateDailyMotivation(): void {
  const quoteEl = byId("daily-motivation-quote");
  if (quoteEl) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
    quoteEl.textContent = `"${motivationalQuotes[dayOfYear % motivationalQuotes.length]}"`;
  }

  const streakEl = byId("streak-counter-display");
  if (streakEl) {
    streakEl.textContent =
      state.streak > 0 ? `${state.streak} ARDIŞIK GÜN` : "HENÜZ SERİ BAŞLAMADI";
  }
}

// ---------------------------------------------------------------------------
// Dose list
// ---------------------------------------------------------------------------

/** Builds one dose row with real elements, so drug names are never parsed as HTML. */
function buildDoseRow(item: RegimenItem): HTMLElement {
  const isTaken = item.status === "taken";

  const row = document.createElement("div");
  row.className = isTaken
    ? "group p-3.5 rounded-2xl border border-outline-variant/70 bg-white hover:border-primary-fixed-dim transition-all flex items-center justify-between gap-3 shadow-2xs"
    : "group p-3.5 rounded-2xl border-2 border-primary-fixed-dim bg-surface-container-low/60 hover:bg-surface-container-low transition-all flex items-center justify-between gap-3 shadow-2xs";

  const left = document.createElement("div");
  left.className = "flex items-center gap-3";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = `w-9 h-9 rounded-full ${
    isTaken
      ? "bg-primary text-white"
      : "border-2 border-outline-variant bg-white text-transparent hover:text-primary hover:border-primary"
  } flex items-center justify-center transition-transform active:scale-90`;
  toggle.setAttribute("aria-pressed", String(isTaken));
  toggle.setAttribute(
    "aria-label",
    `${item.compound} ${item.dose}, ${isTaken ? "alındı olarak işaretlendi" : "henüz alınmadı"}. Durumu değiştir.`
  );
  toggle.innerHTML = `<span class="material-symbols-outlined text-[18px]" aria-hidden="true">check</span>`;
  toggle.addEventListener("click", () => toggleDoseItem(item.id));

  const info = document.createElement("div");
  const title = document.createElement("div");
  title.className = "text-xs font-bold text-on-surface flex items-center gap-1.5";
  const compound = document.createElement("span");
  compound.textContent = item.compound;
  const dose = document.createElement("span");
  dose.className =
    "font-mono text-[10px] text-primary font-semibold bg-surface-container px-1.5 py-0.5 rounded";
  dose.textContent = item.dose;
  title.append(compound, dose);

  const meta = document.createElement("div");
  meta.className = "text-[11px] text-on-surface-variant";
  meta.textContent = `${item.time} · ${item.note}`;
  info.append(title, meta);
  left.append(toggle, info);

  const right = document.createElement("div");
  right.className = "flex items-center gap-2";

  const status = document.createElement("span");
  status.className = `text-[10px] font-mono ${
    isTaken
      ? "font-bold text-primary px-2 py-0.5 rounded-full bg-surface-container-high border border-primary-fixed-dim"
      : "font-semibold text-outline px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/60"
  }`;
  status.textContent = isTaken ? "ALINDI" : "BEKLİYOR";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className =
    "opacity-0 group-hover:opacity-100 focus:opacity-100 text-outline hover:text-error transition-opacity p-2";
  remove.setAttribute("aria-label", `${item.compound} dozunu listeden sil`);
  remove.innerHTML = `<span class="material-symbols-outlined text-[16px]" aria-hidden="true">delete</span>`;
  remove.addEventListener("click", () => removeDoseItem(item.id));

  right.append(status, remove);
  row.append(left, right);
  return row;
}

export function renderCockpitSlots(): void {
  const container = byId("tracker-slots");
  if (!container) return;

  container.textContent = "";
  const countBadge = byId("slot-count-badge");

  if (state.regimen.length === 0) {
    container.innerHTML = `
      <div class="p-5 rounded-2xl bg-surface-container-low/70 border border-dashed border-outline-variant/70 text-center space-y-2">
        <span class="material-symbols-outlined text-outline text-[28px]" aria-hidden="true">medication</span>
        <div class="text-xs font-bold text-on-surface">Henüz doz eklemediniz</div>
        <p class="text-[11px] text-on-surface-variant max-w-[240px] mx-auto leading-relaxed">
          "Özel doz ekle" düğmesine basın veya ilaç ansiklopedisinden bir ilaç seçip
          kokpite ekleyin.
        </p>
      </div>
    `;
    if (countBadge) countBadge.textContent = "0 planlandı";
    return;
  }

  state.regimen.forEach((item) => container.appendChild(buildDoseRow(item)));
  if (countBadge) countBadge.textContent = `${state.regimen.length} planlandı`;
}

export function toggleDoseItem(id: string): void {
  const item = state.regimen.find((d) => d.id === id);
  if (!item) return;
  item.status = item.status === "taken" ? "pending" : "taken";
  saveRegimen(state.regimen);
  renderCockpitSlots();
  recalculateAdherence();
}

export function removeDoseItem(id: string): void {
  const item = state.regimen.find((d) => d.id === id);
  const name = item ? item.compound : "Doz";
  state.regimen = state.regimen.filter((d) => d.id !== id);
  saveRegimen(state.regimen);
  renderCockpitSlots();
  recalculateAdherence();
  showToast(`${name} listeden kaldırıldı.`, "info");
}

// ---------------------------------------------------------------------------
// Adherence
// ---------------------------------------------------------------------------

export function recalculateAdherence(): void {
  const summary = calculateAdherence(state.regimen);

  const pct = byId("donut-pct");
  if (pct) pct.textContent = summary.label;

  const ring = byId("svg-adherence-ring");
  if (ring) ring.setAttribute("stroke-dasharray", `${summary.percent}, 100`);

  const taken = byId("doses-taken-count");
  const total = byId("doses-total-count");
  if (taken && total) {
    taken.textContent = String(summary.taken);
    total.textContent = String(summary.total);
  }

  const pending = state.regimen
    .filter((d) => d.status === "pending")
    .sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

  const hint = byId("next-dose-hint");
  if (hint) {
    if (state.regimen.length === 0) {
      hint.textContent = "Henüz planlanmış doz yok.";
    } else if (pending.length > 0) {
      hint.textContent = `Sıradaki: ${pending[0].time} (${pending[0].compound})`;
    } else {
      hint.textContent = "Bugünkü tüm dozlarınızı aldınız.";
    }
  }

  const badge = byId("daily-completion-badge");
  if (badge) badge.textContent = `%${summary.percent} hedef`;
}

// ---------------------------------------------------------------------------
// Hydration and PRN
// ---------------------------------------------------------------------------

export function addHydration(amountMl: number): void {
  state.hydration.current = Math.min(state.hydration.current + amountMl, HYDRATION_CEILING_ML);
  saveHydration(state.hydration);
  updateHydrationUI();
}

export function updateHydrationUI(): void {
  const { current, target } = state.hydration;
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const text = byId("hydration-text");
  if (text) {
    text.textContent = `Su: ${(current / 1000).toFixed(1)}L / ${(target / 1000).toFixed(1)}L`;
  }

  const pctEl = byId("hydration-pct");
  if (pctEl) pctEl.textContent = `%${pct}`;

  const bar = byId("hydration-bar");
  if (bar) {
    bar.style.width = `${pct}%`;
    const track = bar.parentElement;
    if (track) {
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-valuenow", String(pct));
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", "100");
      track.setAttribute("aria-label", "Günlük su alımı");
    }
  }
}

export function quickLogPRN(name: string, _icon: string, dose: string, isWater = false): void {
  state.regimen.push({
    id: `prn-${Date.now()}`,
    compound: name,
    dose,
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    note: "Gerektiğinde alındı",
    status: "taken",
  });
  saveRegimen(state.regimen);
  renderCockpitSlots();
  recalculateAdherence();
  showToast(`${name} (${dose}) kaydedildi.`, "success");
  if (isWater) addHydration(250);
}

// ---------------------------------------------------------------------------
// Custom dose
// ---------------------------------------------------------------------------

export function handleCustomDoseSubmit(event: Event): void {
  event.preventDefault();

  const name = byId<HTMLInputElement>("custom-drug-name")?.value.trim() ?? "";
  const dose = byId<HTMLInputElement>("custom-drug-dose")?.value.trim() ?? "";
  const time = byId<HTMLInputElement>("custom-drug-time")?.value ?? "";
  const note = byId<HTMLInputElement>("custom-drug-note")?.value.trim() || "Kendi eklediğiniz doz";

  if (!name || !dose || !time) {
    showToast("İlaç adı, doz ve saat alanları zorunludur.", "warning");
    return;
  }

  state.regimen.push({
    id: `custom-${Date.now()}`,
    compound: name,
    dose,
    time,
    note,
    status: "pending",
  });
  saveRegimen(state.regimen);
  renderCockpitSlots();
  recalculateAdherence();
  closeCustomDoseModal();
  showToast(`${name} (${dose}) eklendi.`, "success");
  (event.target as HTMLFormElement).reset();
}

/** Re-renders everything the cockpit shows. Used after a vault import. */
export function refreshCockpit(): void {
  renderCockpitSlots();
  recalculateAdherence();
  updateHydrationUI();
  rotateDailyMotivation();
}

export function initCockpit(): void {
  evaluateDailyStreak(state);
  updateDateDisplay();
  refreshCockpit();

  Object.assign(window, {
    toggleDoseItem,
    removeDoseItem,
    quickLogPRN,
    addHydration,
    handleCustomDoseSubmit,
  });
}
