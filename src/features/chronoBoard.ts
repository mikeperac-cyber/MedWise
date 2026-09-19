/**
 * Kronobiyoloji page.
 *
 * In the single-page build these fields were filled in as a side effect of
 * selecting a drug in the encyclopedia, so the chronobiology view was blank
 * unless you had visited another tab first. Now that it is its own document it
 * loads its own data and offers its own picker.
 */

import type { Drug } from "../types/index.ts";
import { state } from "../state.ts";
import { isVerifiedAtc } from "../utils/provenance.ts";
import { byId, escapeHtml } from "../shell/shell.ts";

/** Prefers a verified record, so the default view is one we can stand behind. */
function defaultDrug(): Drug | undefined {
  return (
    state.drugs.find((d) => isVerifiedAtc(d.atc) && Boolean(d.chronotherapy)) ?? state.drugs[0]
  );
}

export function showChronotherapyFor(drugId: string): void {
  const drug = state.drugs.find((d) => d.id === drugId);
  if (!drug) return;

  const name = drug.name.split("&")[0].trim();
  const chrono = drug.chronotherapy;

  const title = byId("chrono-title");
  if (title) title.textContent = `Zamanlama: ${name}`;

  const desc = byId("chrono-desc");
  if (desc) {
    desc.textContent = chrono?.rationale ?? "Bu ilaç için özel bir zamanlama notu kayıtlı değil.";
  }

  const time = byId("chrono-time");
  if (time) time.textContent = chrono ? `Önerilen: ${chrono.idealTime}` : "Önerilen: belirtilmemiş";

  const picker = byId<HTMLSelectElement>("chrono-drug-picker");
  if (picker && picker.value !== drugId) picker.value = drugId;
}

/**
 * Builds the picker. Only records with a chronotherapy note are listed, and the
 * unverified ones are marked, so the reader knows which timings are sourced.
 */
function renderPicker(): void {
  const host = byId("chrono-picker-host");
  if (!host) return;

  const options = state.drugs
    .filter((d) => Boolean(d.chronotherapy))
    .slice(0, 200)
    .map((d) => {
      const mark = isVerifiedAtc(d.atc) ? "" : " (kaynak doğrulanmadı)";
      return `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name.split("&")[0].trim())}${mark}</option>`;
    })
    .join("");

  host.innerHTML = `
    <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2" for="chrono-drug-picker">
      İlaç seçin
    </label>
    <select
      id="chrono-drug-picker"
      class="w-full max-w-md px-3 py-2.5 rounded-xl border border-outline-variant bg-white text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
    >
      ${options}
    </select>
  `;

  byId<HTMLSelectElement>("chrono-drug-picker")?.addEventListener("change", (e) => {
    showChronotherapyFor((e.target as HTMLSelectElement).value);
  });
}

export function initChronoBoard(drugsLoaded: Promise<void>): void {
  void drugsLoaded.then(() => {
    renderPicker();
    const requested = new URLSearchParams(window.location.search).get("ilac");
    const target =
      requested && state.drugs.some((d) => d.id === requested) ? requested : defaultDrug()?.id;
    if (target) showChronotherapyFor(target);
  });
}
