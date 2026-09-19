/**
 * Çapraz Etkileşim page: pick several drugs, see how they affect each other.
 *
 * The analysis engine in `services/interactions.ts` is unchanged. What changed
 * is the presentation: every finding now leads with a plain-Turkish "what this
 * means for you" line, and the mechanism text that used to be the headline sits
 * underneath it. The severity labels lost their all-caps Latin phrasing
 * ("KRİTİK KONTRENDİKASYON") in favour of wording a patient can act on.
 */

import type { Drug } from "../types/index.ts";
import { state } from "../state.ts";
import { normalizeClinicalText } from "../utils/clinical.ts";
import { checkDrugInteractions, type InteractionAnalysis } from "../services/interactions.ts";
import { byId, escapeHtml, showToast } from "../shell/shell.ts";

const MAX_TRAY_SIZE = 6;

let tray: Drug[] = [];

function shortName(drug: Drug): string {
  return drug.name.split("&")[0].trim();
}

/** Patient-facing severity wording, paired with the badge styling. */
const SEVERITY_PRESENTATION = {
  critical: {
    badge: "bg-red-600 text-white border-red-700",
    label: "Birlikte kullanmayın",
    advice: "Bu ikisini birlikte kullanmadan önce mutlaka doktorunuza sorun.",
  },
  severe: {
    badge: "bg-error text-white border-error-container",
    label: "Dikkat gerekir",
    advice: "Doktorunuz bu ikisini birlikte yazdıysa yakın takip gerekir.",
  },
  moderate: {
    badge: "bg-amber-500 text-white border-amber-600",
    label: "Zamanlamaya dikkat",
    advice: "Genellikle saatleri ayırmak yeterli olur. Eczacınıza danışın.",
  },
  mild: {
    badge: "bg-blue-600 text-white border-blue-700",
    label: "Hafif etkileşim",
    advice: "Ciddi bir sorun beklenmez, yine de belirtileri takip edin.",
  },
  none: {
    badge: "bg-emerald-600 text-white border-emerald-700",
    label: "Bilinen etkileşim yok",
    advice: "Seçtiğiniz ilaçlar arasında bilinen önemli bir etkileşim bulunamadı.",
  },
} as const;

export function getTray(): readonly Drug[] {
  return tray;
}

export function addDrugToInteractionTray(drugId: string): void {
  const drug = state.drugs.find((d) => d.id === drugId);
  if (!drug) return;

  if (tray.some((d) => d.id === drugId)) {
    showToast(`${shortName(drug)} zaten listede.`, "info");
    return;
  }
  if (tray.length >= MAX_TRAY_SIZE) {
    showToast(`En fazla ${MAX_TRAY_SIZE} ilaç karşılaştırabilirsiniz.`, "warning");
    return;
  }

  tray.push(drug);
  renderInteractionTray();
  renderInteractionResults();
  showToast(`${shortName(drug)} listeye eklendi.`, "success");
}

export function removeDrugFromInteractionTray(drugId: string): void {
  tray = tray.filter((d) => d.id !== drugId);
  renderInteractionTray();
  renderInteractionResults();
}

export function clearInteractionTray(): void {
  tray = [];
  renderInteractionTray();
  renderInteractionResults();
  showToast("Liste temizlendi.", "info");
}

export function loadInteractionPreset(drugIds: string[]): void {
  tray = drugIds
    .map((id) => state.drugs.find((d) => d.id === id))
    .filter((d): d is Drug => Boolean(d));
  renderInteractionTray();
  renderInteractionResults();
  showToast("Örnek ilaç listesi yüklendi.", "info");
}

export function renderInteractionTray(): void {
  const host = byId("interaction-tray");
  if (!host) return;

  if (tray.length === 0) {
    host.innerHTML = `
      <div class="text-xs text-outline italic flex items-center gap-1.5 py-1">
        <span class="material-symbols-outlined text-[17px]" aria-hidden="true">info</span>
        <span>Henüz ilaç seçmediniz. Aşağıdaki kutudan arayarak ekleyin.</span>
      </div>
    `;
    return;
  }

  host.textContent = "";
  tray.forEach((drug) => {
    const chip = document.createElement("span");
    chip.className =
      "inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-white border border-outline-variant/80 text-xs font-semibold text-on-surface shadow-2xs";

    const label = document.createElement("span");
    label.textContent = shortName(drug);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className =
      "p-1 rounded-full hover:bg-error-container hover:text-error text-outline transition-colors";
    remove.setAttribute("aria-label", `${shortName(drug)} ilacını listeden çıkar`);
    remove.innerHTML = `<span class="material-symbols-outlined text-[15px]" aria-hidden="true">close</span>`;
    remove.addEventListener("click", () => removeDrugFromInteractionTray(drug.id));

    chip.append(label, remove);
    host.appendChild(chip);
  });
}

export function renderInteractionResults(): void {
  const container = byId("interaction-results-container");
  if (!container) return;

  if (tray.length < 2) {
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-surface-container-low/40 border border-dashed border-outline-variant/70 text-center space-y-2">
        <span class="material-symbols-outlined text-outline text-[32px]" aria-hidden="true">biotech</span>
        <div class="text-sm font-bold text-on-surface">En az iki ilaç seçin</div>
        <p class="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Birlikte kullandığınız ilaçların birbirini etkileyip etkilemediğini
          görmek için listeye en az iki ilaç ekleyin.
        </p>
      </div>
    `;
    return;
  }

  const analysis: InteractionAnalysis = checkDrugInteractions([...tray]);
  const overall = SEVERITY_PRESENTATION[analysis.maxSeverity];

  const header = `
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container pb-4">
      <div>
        <span class="text-[10px] font-mono font-bold text-outline uppercase tracking-wider block">Sonuç</span>
        <h4 class="font-serif text-lg font-bold text-on-surface">${escapeHtml(overall.advice)}</h4>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-bold uppercase border shadow-2xs ${overall.badge}">
        ${escapeHtml(overall.label)}
      </span>
    </div>
  `;

  let body: string;
  if (analysis.interactions.length === 0) {
    body = `
      <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
        <span class="material-symbols-outlined text-emerald-600 text-[24px]" aria-hidden="true">check_circle</span>
        <span>
          Seçtiğiniz ${tray.length} ilaç arasında veri tabanımızda kayıtlı önemli bir
          etkileşim bulunamadı. Bu, hiç etkileşim olmadığı anlamına gelmez; yeni bir
          ilaca başlarken eczacınıza danışın.
        </span>
      </div>
    `;
  } else {
    body =
      `<div class="space-y-3">` +
      analysis.interactions
        .map((item) => {
          const pres = SEVERITY_PRESENTATION[item.severity];
          const isCrit = item.severity === "critical" || item.severity === "severe";
          const cardBorder = isCrit
            ? "border-l-4 border-l-error border-error/30 bg-surface-container-low"
            : "border-l-4 border-l-amber-500 border-amber-300 bg-amber-50/50";
          const icon = isCrit ? "dangerous" : "warning";
          const iconColor = isCrit ? "text-error" : "text-amber-600";

          return `
            <div class="p-4 rounded-2xl border ${cardBorder} space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined ${iconColor} text-[20px]" aria-hidden="true">${icon}</span>
                  <span class="font-bold text-xs sm:text-sm text-on-surface">${escapeHtml(item.title)}</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white border border-outline-variant/60 text-outline whitespace-nowrap">
                  ${escapeHtml(item.drugA)} + ${escapeHtml(item.drugB)}
                </span>
              </div>

              <p class="text-sm text-on-surface leading-relaxed font-medium">
                ${escapeHtml(pres.advice)}
              </p>
              <p class="text-xs text-on-surface leading-relaxed">
                <span class="font-semibold">Ne yapmalısınız:</span> ${escapeHtml(item.clinicalAction)}
              </p>

              <details class="pt-2 border-t border-outline-variant/30">
                <summary class="text-xs font-semibold text-primary cursor-pointer hover:underline">
                  Neden? Biyokimyasal mekanizmayı göster
                </summary>
                <p class="mt-2 text-xs text-on-surface-variant leading-relaxed">
                  ${escapeHtml(item.mechanism)}
                </p>
                <p class="mt-1 text-[10px] font-mono text-outline">
                  Etkileşim sınıfı: ${escapeHtml(item.category)}
                </p>
              </details>
            </div>
          `;
        })
        .join("") +
      `</div>`;
  }

  container.innerHTML = `
    <div class="p-5 rounded-2xl bg-white border border-outline-variant/70 shadow-xs space-y-4">
      ${header}
      ${body}
    </div>
  `;
}

export function setupInteractionSearchEvents(): void {
  const input = byId<HTMLInputElement>("interaction-search-input");
  const dropdown = byId("interaction-search-dropdown");
  if (!input || !dropdown) return;

  input.addEventListener("input", () => {
    const query = normalizeClinicalText(input.value);
    if (!query || query.length < 2) {
      dropdown.classList.add("hidden");
      return;
    }

    const matches = state.drugs
      .filter(
        (d) =>
          normalizeClinicalText(d.name).includes(query) ||
          normalizeClinicalText(d.genericNameTR).includes(query) ||
          normalizeClinicalText(d.genericNameUS).includes(query) ||
          d.brandTR.some((b) => normalizeClinicalText(b).includes(query))
      )
      .slice(0, 10);

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="p-3 text-xs text-outline text-center">İlaç bulunamadı</div>`;
      dropdown.classList.remove("hidden");
      return;
    }

    dropdown.innerHTML = matches
      .map(
        (d) => `
        <div class="p-2.5 hover:bg-surface-container-low cursor-pointer border-b border-surface-container/60 last:border-0 transition-colors flex items-center justify-between text-xs" data-drug-id="${escapeHtml(d.id)}">
          <div>
            <span class="font-bold text-on-surface">${escapeHtml(d.name)}</span>
            <span class="text-[11px] text-on-surface-variant block font-mono">Etken: ${escapeHtml(d.genericNameTR)}</span>
          </div>
          <span class="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">add_circle</span>
        </div>
      `
      )
      .join("");

    dropdown.querySelectorAll<HTMLElement>("[data-drug-id]").forEach((row) => {
      row.addEventListener("click", () => {
        addDrugToInteractionTray(row.dataset.drugId ?? "");
        dropdown.classList.add("hidden");
        input.value = "";
      });
    });
    dropdown.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (!input.contains(target) && !dropdown.contains(target)) {
      dropdown.classList.add("hidden");
    }
  });
}

export function initInteractionLab(drugsLoaded: Promise<void>): void {
  Object.assign(window, {
    addDrugToInteractionTray,
    removeDrugFromInteractionTray,
    clearInteractionTray,
    loadInteractionPreset,
  });

  renderInteractionTray();
  renderInteractionResults();

  void drugsLoaded.then(() => {
    setupInteractionSearchEvents();
    // A drug handed over from the encyclopedia arrives as ?ilac=<id>.
    const requested = new URLSearchParams(window.location.search).get("ilac");
    if (requested) addDrugToInteractionTray(requested);
  });
}
