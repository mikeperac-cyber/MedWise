/**
 * İlaç Ansiklopedisi page: drug loading, search, and the monograph renderer.
 *
 * Two deliberate changes from the single-page build:
 *
 * 1. Pill-first ordering. A person who cannot read "HMG-CoA redüktaz inhibitörü"
 *    can still recognise a white oval tablet stamped "AE 20/10". The physical
 *    description and the plain-language summary render above the molecular and
 *    pharmacokinetic detail, which is now secondary rather than the headline.
 *
 * 2. Provenance labelling. 537 of 593 records carry identifiers synthesised by
 *    scripts/generate_drugs.mjs. Those records now render a prominent warning
 *    band instead of presenting the invented ATC/NDC/TİTCK values as fact.
 */

import type { Drug, RegimenItem } from "../types/index.ts";
import { state } from "../state.ts";
import { molecularSvgs } from "../constants/svgs.ts";
import { loadDrugDatabase } from "./drugData.ts";
import { normalizeClinicalText } from "../utils/clinical.ts";
import { getDrugProvenance } from "../utils/provenance.ts";
import { buildPlainSummary } from "../utils/plainLanguage.ts";
import { byId, escapeHtml, showToast } from "../shell/shell.ts";
import { loadFromStorage, saveRegimen } from "../services/storage.ts";

const SEARCH_DEBOUNCE_MS = 120;
const MAX_RESULTS = 20;

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let currentResultIds: string[] = [];
let activeResultIndex = -1;

/** Short display name: "Atorvastatin & Ezetimib" renders as "Atorvastatin". */
function shortName(drug: Drug): string {
  return drug.name.split("&")[0].trim();
}

// ---------------------------------------------------------------------------
// Quick chips
// ---------------------------------------------------------------------------

export function renderQuickChips(): void {
  const container = byId("quick-drug-chips");
  if (!container) return;

  container.textContent = "";

  const label = document.createElement("span");
  label.className = "text-xs font-bold text-outline uppercase tracking-wider mr-1";
  label.textContent = "Ön yüklenmişler:";
  container.appendChild(label);

  state.drugs.slice(0, 5).forEach((drug, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      index === 0
        ? "px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold shadow-xs hover:bg-[#99000c] transition-all"
        : "px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium border border-outline-variant/50 transition-colors";
    btn.textContent = shortName(drug);
    btn.addEventListener("click", () => selectDrug(drug.id));
    container.appendChild(btn);
  });
}

// ---------------------------------------------------------------------------
// Monograph
// ---------------------------------------------------------------------------

/** Renders the provenance banner that sits at the top of every monograph. */
function renderProvenanceBanner(drug: Drug): void {
  const host = byId("mono-provenance");
  if (!host) return;

  const prov = getDrugProvenance(drug);
  const verified = prov.status === "verified";

  const tone = verified
    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : "border-error/50 bg-error-container/40 text-on-error-container";
  const icon = verified ? "verified_user" : "report";

  const links = prov.fields
    .map((f) => {
      const value = escapeHtml(f.value || "—");
      const label = escapeHtml(f.label);
      if (f.lookupUrl) {
        return `<li><span class="font-semibold">${label}:</span> <a class="font-mono underline hover:no-underline" href="${escapeHtml(f.lookupUrl)}" target="_blank" rel="noreferrer">${value}</a></li>`;
      }
      return `<li><span class="font-semibold">${label}:</span> <span class="font-mono line-through opacity-70">${value}</span> <span class="font-semibold">(üretilmiş değer)</span></li>`;
    })
    .join("");

  host.innerHTML = `
    <div class="rounded-2xl border-2 ${tone} p-4 space-y-2" role="${verified ? "note" : "alert"}">
      <div class="flex items-start gap-2">
        <span class="material-symbols-outlined text-[20px] flex-shrink-0" aria-hidden="true">${icon}</span>
        <p class="text-xs font-semibold leading-relaxed">${escapeHtml(prov.notice)}</p>
      </div>
      <ul class="text-[11px] space-y-0.5 pl-7">${links}</ul>
    </div>
  `;
}

/** Renders the plain-language layer, or an explicit "not written yet" state. */
function renderPlainSummary(drug: Drug): void {
  const host = byId("mono-plain-summary");
  if (!host) return;

  const plain = buildPlainSummary(drug);

  if (!plain) {
    host.innerHTML = `
      <div class="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/60 p-4">
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Bu ilaç için sade dil özeti henüz yazılmadı. Aşağıdaki teknik açıklama
          sağlık çalışanları içindir. İlacınızı ne için kullandığınızı
          doktorunuza veya eczacınıza sorun.
        </p>
      </div>
    `;
    return;
  }

  host.innerHTML = `
    <div class="rounded-2xl border border-primary-fixed-dim bg-primary-fixed/25 p-5 space-y-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">volunteer_activism</span>
        <h3 class="font-serif text-base font-bold text-on-surface">Bu ilaç ne işe yarar?</h3>
      </div>
      <p class="text-sm text-on-surface leading-relaxed">${escapeHtml(plain.purpose)}</p>
      <p class="text-sm text-on-surface leading-relaxed">
        <span class="font-semibold">Nasıl alınır:</span> ${escapeHtml(plain.howToTake)}
      </p>
      <details class="pt-2 border-t border-primary-fixed-dim/70">
        <summary class="text-xs font-semibold text-primary cursor-pointer hover:underline">
          Neden? Teknik açıklamayı göster
        </summary>
        <p class="mt-2 text-xs text-on-surface-variant leading-relaxed">${escapeHtml(drug.description)}</p>
        <p class="mt-2 text-[10px] font-mono text-outline">
          Sade dil metni ${escapeHtml(plain.derivedFrom)} ATC sınıfından türetildi.
        </p>
      </details>
    </div>
  `;
}

/** Renders the physical-appearance card: how the tablet actually looks. */
function renderPillCard(drug: Drug): void {
  const pillLeft = byId("mono-pill-left");
  const pillRight = byId("mono-pill-right");
  if (pillLeft && pillRight) {
    pillLeft.style.backgroundColor = drug.pillGeometry.colorLeft;
    pillLeft.textContent = drug.pillGeometry.textLeft;
    pillRight.style.backgroundColor = drug.pillGeometry.colorRight;
    pillRight.textContent = drug.pillGeometry.textRight;
  }

  const shape = byId("mono-pill-shape");
  if (shape) shape.textContent = drug.pillGeometry.shape;

  const imprint = byId("mono-pill-imprint");
  if (imprint) {
    imprint.textContent = `${drug.pillGeometry.dimensions} · Üzerinde '${drug.pillGeometry.imprint}' yazar`;
  }
}

function renderInteractionList(drug: Drug): void {
  const list = byId("mono-interactions-list");
  if (!list) return;

  list.innerHTML = drug.interactions
    .map((item) => {
      const isSevere = item.severity === "severe";
      const borderClass = isSevere
        ? "border-error/40 border-l-4 border-l-error bg-surface-container-low"
        : "border-amber-300/80 border-l-4 border-l-amber-500 bg-[#fffbeb]";
      const icon = isSevere ? "dangerous" : "warning";
      const iconColor = isSevere ? "text-error" : "text-amber-600";
      const titleColor = isSevere ? "text-on-error-container" : "text-amber-900";
      const badgeClass = isSevere
        ? "bg-error-container text-on-error-container"
        : "bg-amber-100 text-amber-800";

      return `
        <div class="rounded-2xl ${borderClass} p-4 space-y-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined ${iconColor} text-[20px]" aria-hidden="true">${icon}</span>
              <span class="font-bold text-xs sm:text-sm ${titleColor}">${escapeHtml(item.title)}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full ${badgeClass} font-mono font-bold text-[9px] uppercase">${escapeHtml(item.badge)}</span>
          </div>
          <p class="text-xs text-on-surface-variant pl-7 leading-relaxed">${escapeHtml(item.description)}</p>
        </div>
      `;
    })
    .join("");
}

export function selectDrug(drugId: string): void {
  const drug = state.drugs.find((d) => d.id === drugId);
  if (!drug) return;
  state.currentDrug = drug;

  const searchInput = byId<HTMLInputElement>("command-search");
  if (searchInput) searchInput.value = drug.name;

  const setText = (id: string, value: string): void => {
    const el = byId(id);
    if (el) el.textContent = value;
  };

  setText("mono-rx-type", drug.rxType);
  setText("mono-ndc", `NDC ${drug.ndc}`);
  setText("mono-atc", `· ATC ${drug.atc}`);
  setText("mono-titck", `· ${drug.titck}`);
  setText("mono-title", drug.name);
  setText("mono-formula", drug.formula);
  setText("mono-chirality", drug.chirality);

  const subtitle = byId("mono-subtitle");
  if (subtitle) {
    subtitle.innerHTML = `Etken madde: <strong class="text-on-surface font-mono">${escapeHtml(drug.genericNameTR)}</strong> · ${escapeHtml(drug.dosageForms)}`;
  }

  const trContainer = byId("mono-brands-tr");
  if (trContainer) {
    trContainer.innerHTML = drug.brandTR
      .map(
        (b) =>
          `<span class="px-2 py-0.5 rounded-md bg-surface-container text-primary font-semibold text-[11px] border border-outline-variant/40">${escapeHtml(b)}</span>`
      )
      .join("");
  }

  const usContainer = byId("mono-brands-us");
  if (usContainer) {
    usContainer.innerHTML = drug.brandUS
      .map(
        (b) =>
          `<span class="px-2 py-0.5 rounded-md bg-tertiary-fixed/40 text-tertiary font-semibold text-[11px] border border-outline-variant/40">${escapeHtml(b)}</span>`
      )
      .join("");
  }

  const svgBox = byId("mono-svg-container");
  if (svgBox) {
    // Values come from a checked-in constant map, never from user input.
    svgBox.innerHTML = molecularSvgs[drug.id] || molecularSvgs.atorvastatin || "";
  }

  renderProvenanceBanner(drug);
  renderPlainSummary(drug);
  renderPillCard(drug);

  setText("mono-tmax", `${drug.pharmacokinetics.tMax} · ${drug.pharmacokinetics.halfLife}`);
  setText("mono-bioavailability", drug.pharmacokinetics.bioavailability);
  setText("mono-cyp-title", "Metabolizma yolağı");
  setText("mono-cyp-desc", drug.pharmacokinetics.metabolismPathway);
  setText("mono-clearance-title", "Atılım");
  setText("mono-clearance-desc", drug.pharmacokinetics.clearance);

  renderInteractionList(drug);

  if (drug.chronotherapy) {
    setText("chrono-title", `Zamanlama: ${shortName(drug)}`);
    setText("chrono-desc", drug.chronotherapy.rationale);
    setText("chrono-time", `Önerilen: ${drug.chronotherapy.idealTime}`);
  }
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

function matchesQuery(drug: Drug, query: string): boolean {
  return (
    normalizeClinicalText(drug.name).includes(query) ||
    normalizeClinicalText(drug.genericNameTR).includes(query) ||
    normalizeClinicalText(drug.genericNameUS).includes(query) ||
    normalizeClinicalText(drug.atc).includes(query) ||
    drug.brandTR.some((b) => normalizeClinicalText(b).includes(query)) ||
    drug.brandUS.some((b) => normalizeClinicalText(b).includes(query))
  );
}

export function searchDrugs(query: string): Drug[] {
  const normalized = normalizeClinicalText(query);
  if (!normalized || normalized.length < 2) return [];
  return state.drugs.filter((d) => matchesQuery(d, normalized));
}

export function clearSearchInput(): void {
  const input = byId<HTMLInputElement>("command-search");
  const dropdown = byId("search-dropdown");
  const clearBtn = byId("search-clear-btn");
  const kbdHint = byId("search-kbd-hint");

  if (input) {
    input.value = "";
    input.focus();
  }
  dropdown?.classList.add("hidden");
  clearBtn?.classList.add("hidden");
  kbdHint?.classList.remove("hidden");
  activeResultIndex = -1;
  currentResultIds = [];
}

export function handleSelectFromSearch(drugId: string): void {
  selectDrug(drugId);
  byId("search-dropdown")?.classList.add("hidden");
  byId("search-clear-btn")?.classList.remove("hidden");
  byId("search-kbd-hint")?.classList.add("hidden");
}

export function executeSearch(): void {
  const input = byId<HTMLInputElement>("command-search");
  if (!input) return;
  const matches = searchDrugs(input.value);
  if (matches.length > 0) {
    selectDrug(matches[0].id);
  } else {
    showToast("Bu isimde bir ilaç bulunamadı.", "info");
  }
}

function renderSearchResults(dropdown: HTMLElement, matches: Drug[]): void {
  const shown = matches.slice(0, MAX_RESULTS);
  currentResultIds = shown.map((d) => d.id);

  let html = shown
    .map((drug) => {
      const unverified = getDrugProvenance(drug).status === "unverified";
      const flag = unverified
        ? `<span class="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-bold text-[9px] uppercase">kaynak yok</span>`
        : `<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase">doğrulandı</span>`;
      return `
        <div class="search-result-item p-3 hover:bg-surface-container-low cursor-pointer border-b border-surface-container/60 last:border-0 transition-colors flex items-center justify-between" role="option" data-drug-id="${escapeHtml(drug.id)}">
          <div>
            <div class="text-xs font-bold text-on-surface flex items-center gap-2">
              <span>${escapeHtml(drug.name)}</span>
              ${flag}
            </div>
            <div class="text-[11px] text-on-surface-variant font-mono">
              Etken: ${escapeHtml(drug.genericNameTR)}
            </div>
          </div>
          <span class="material-symbols-outlined text-[18px] text-outline" aria-hidden="true">arrow_forward</span>
        </div>
      `;
    })
    .join("");

  if (matches.length > MAX_RESULTS) {
    html += `
      <div class="p-2.5 text-center text-[11px] text-outline font-medium bg-surface-container-low/60 border-t border-surface-container">
        Toplam <strong>${matches.length}</strong> sonuç. İlk ${MAX_RESULTS} tanesi gösteriliyor.
      </div>
    `;
  }

  dropdown.innerHTML = html;
  dropdown.querySelectorAll<HTMLElement>("[data-drug-id]").forEach((row) => {
    row.addEventListener("click", () => handleSelectFromSearch(row.dataset.drugId ?? ""));
  });
  dropdown.classList.remove("hidden");
}

export function setupSearchEvents(): void {
  const input = byId<HTMLInputElement>("command-search");
  const dropdown = byId("search-dropdown");
  if (!input || !dropdown) return;

  const clearBtn = byId("search-clear-btn");
  const kbdHint = byId("search-kbd-hint");

  const updateHighlight = (): void => {
    dropdown.querySelectorAll(".search-result-item").forEach((item, index) => {
      const on = index === activeResultIndex;
      item.classList.toggle("bg-surface-container", on);
      item.classList.toggle("ring-1", on);
      item.classList.toggle("ring-primary/40", on);
      item.setAttribute("aria-selected", String(on));
      if (on) (item as HTMLElement).scrollIntoView({ block: "nearest" });
    });
  };

  input.addEventListener("input", () => {
    const hasText = input.value.trim().length > 0;
    clearBtn?.classList.toggle("hidden", !hasText);
    kbdHint?.classList.toggle("hidden", hasText);

    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      activeResultIndex = -1;
      currentResultIds = [];

      const matches = searchDrugs(input.value);
      if (matches.length === 0) {
        dropdown.innerHTML = `<div class="p-4 text-xs text-outline text-center">Sonuç bulunamadı.</div>`;
        dropdown.classList.toggle("hidden", input.value.trim().length < 2);
        return;
      }
      renderSearchResults(dropdown, matches);
    }, SEARCH_DEBOUNCE_MS);
  });

  input.addEventListener("keydown", (e) => {
    const open = !dropdown.classList.contains("hidden") && currentResultIds.length > 0;
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      activeResultIndex = Math.min(activeResultIndex + 1, currentResultIds.length - 1);
      updateHighlight();
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      activeResultIndex = Math.max(activeResultIndex - 1, -1);
      updateHighlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeResultIndex >= 0 && activeResultIndex < currentResultIds.length) {
        handleSelectFromSearch(currentResultIds[activeResultIndex]);
      } else {
        executeSearch();
      }
      dropdown.classList.add("hidden");
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (!input.contains(target) && !dropdown.contains(target)) {
      dropdown.classList.add("hidden");
    }
  });

  // "/" and Ctrl+K focus the search box, as in the previous build.
  window.addEventListener("keydown", (e) => {
    const el = document.activeElement;
    const editing =
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        (el as HTMLElement).isContentEditable);

    if ((e.key === "/" && !editing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}

// ---------------------------------------------------------------------------
// Hand-offs to the other pages
// ---------------------------------------------------------------------------

/** Adds the open monograph's drug to the cockpit's dose list. */
export function addCurrentDrugToCockpit(): void {
  const drug = state.currentDrug;
  if (!drug) return;

  const item: RegimenItem = {
    id: `dose-${Date.now()}`,
    compound: shortName(drug),
    dose: drug.defaultDose || "Standart",
    time: drug.chronotherapy?.idealTime.slice(0, 5) || "09:00",
    note: drug.commonSchedule || "Günlük doz",
    status: "pending",
  };

  const stored = loadFromStorage();
  const regimen = stored.regimen && stored.regimen.length > 0 ? stored.regimen : state.regimen;
  regimen.push(item);
  state.regimen = regimen;
  saveRegimen(regimen);

  showToast(`${item.compound} (${item.dose}) doz kokpitine eklendi.`, "success");

  const btn = byId("add-protocol-btn");
  if (btn) {
    const original = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined text-[17px]" aria-hidden="true">check</span><span>Kokpite eklendi</span>`;
    btn.classList.replace("bg-primary", "bg-tertiary");
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.replace("bg-tertiary", "bg-primary");
    }, 1600);
  }
}

/**
 * Opens the interaction page with this drug preselected.
 * A real navigation now, rather than a hash route change.
 */
export function sendCurrentDrugToInteractions(): void {
  const drug = state.currentDrug;
  if (!drug) return;
  window.location.href = `/etkilesim?ilac=${encodeURIComponent(drug.id)}`;
}

/** Boots the encyclopedia page. */
export async function initEncyclopedia(): Promise<void> {
  await loadDrugDatabase();

  // Report the real record count. The previous build multiplied this by 1548
  // and displayed the product as "indexed formulations", which was not true.
  const badge = byId("db-count-badge");
  if (badge) badge.textContent = `${state.drugs.length} ilaç kaydı`;

  renderQuickChips();
  setupSearchEvents();

  Object.assign(window, {
    selectDrug,
    clearSearchInput,
    executeSearch,
    handleSelectFromSearch,
    addCurrentDrugToCockpit,
    sendCurrentDrugToInteractions,
  });

  if (state.drugs.length > 0) selectDrug(state.drugs[0].id);
}
