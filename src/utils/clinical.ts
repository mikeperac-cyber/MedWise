import type { Drug, RegimenItem } from "../types";

/**
 * Normalizes clinical search terms with full Turkish character folding.
 */
export function normalizeClinicalText(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ğüşıöç]/gi, "");
}

export interface AdherenceSummary {
  total: number;
  taken: number;
  percent: number;
  strokeDash: string;
  label: string;
}

/**
 * Calculates adherence percentage and SVG stroke dash representation.
 * Standard circle radius r=32 has circumference ~ 201.06.
 */
export function calculateAdherence(
  regimen: RegimenItem[],
  circumference = 201.06
): AdherenceSummary {
  const total = regimen.length;
  if (total === 0) {
    return {
      total: 0,
      taken: 0,
      percent: 0,
      strokeDash: `0 ${circumference}`,
      label: "%0",
    };
  }

  const taken = regimen.filter((item) => item.status === "taken").length;
  const percent = Math.round((taken / total) * 100);
  const strokeLength = (percent / 100) * circumference;

  return {
    total,
    taken,
    percent,
    strokeDash: `${strokeLength.toFixed(2)} ${circumference}`,
    label: `%${percent}`,
  };
}

export interface SeverityPresentation {
  label: string;
  badgeClass: string;
  containerClass: string;
}

/**
 * Maps drug interaction severity to visual UI badge presentation.
 */
export function getSeverityPresentation(severity: string): SeverityPresentation {
  const normalized = severity.toLowerCase().trim();
  if (normalized === "severe" || normalized === "kritik") {
    return {
      label: "KRİTİK KONTRENDİKASYON",
      badgeClass: "bg-error/10 text-error border-error/20",
      containerClass: "border-l-4 border-l-error bg-error-container/20",
    };
  }
  if (normalized === "warning" || normalized === "uyarı") {
    return {
      label: "ÖNEMLİ ETKİLEŞİM / DİKKAT",
      badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      containerClass: "border-l-4 border-l-amber-500 bg-amber-500/10",
    };
  }
  return {
    label: "BİLGİLENDİRME",
    badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    containerClass: "border-l-4 border-l-blue-500 bg-blue-500/10",
  };
}

/**
 * Extracts chronotherapy recommendation with safe fallback.
 */
export function getChronotherapyRecommendation(drug: Drug | null): {
  idealTime: string;
  rationale: string;
} {
  if (!drug || !drug.chronotherapy) {
    return {
      idealTime: "09:00 (Sabah Saatleri)",
      rationale: "Günlük olağan tedavi planı ve hekim tavsiyesine uygun alım.",
    };
  }
  return {
    idealTime: drug.chronotherapy.idealTime,
    rationale: drug.chronotherapy.rationale,
  };
}
