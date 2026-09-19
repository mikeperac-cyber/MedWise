import { describe, it, expect } from "vitest";
import {
  calculateAdherence,
  normalizeClinicalText,
  getSeverityPresentation,
  getChronotherapyRecommendation,
} from "../src/utils/clinical";
import type { RegimenItem, Drug } from "../src/types";

describe("Clinical Utilities & Calculations", () => {
  describe("Adherence Calculation", () => {
    it("returns 0% when regimen is empty", () => {
      const summary = calculateAdherence([]);
      expect(summary.total).toBe(0);
      expect(summary.taken).toBe(0);
      expect(summary.percent).toBe(0);
      expect(summary.label).toBe("%0");
      expect(summary.strokeDash).toBe("0 201.06");
    });

    it("returns 100% when all doses are taken", () => {
      const regimen: RegimenItem[] = [
        {
          id: "1",
          compound: "Atorvastatin",
          dose: "20mg",
          time: "08:00",
          note: "",
          status: "taken",
        },
        {
          id: "2",
          compound: "Ezetimib",
          dose: "10mg",
          time: "12:00",
          note: "",
          status: "taken",
        },
      ];
      const summary = calculateAdherence(regimen);
      expect(summary.total).toBe(2);
      expect(summary.taken).toBe(2);
      expect(summary.percent).toBe(100);
      expect(summary.label).toBe("%100");
    });

    it("correctly calculates partial adherence with rounding", () => {
      const regimen: RegimenItem[] = [
        {
          id: "1",
          compound: "Atorvastatin",
          dose: "20mg",
          time: "08:00",
          note: "",
          status: "taken",
        },
        {
          id: "2",
          compound: "Ezetimib",
          dose: "10mg",
          time: "12:00",
          note: "",
          status: "pending",
        },
        {
          id: "3",
          compound: "Omega-3",
          dose: "1000mg",
          time: "20:00",
          note: "",
          status: "taken",
        },
      ];
      // 2 taken out of 3 = 66.666% -> 67%
      const summary = calculateAdherence(regimen);
      expect(summary.total).toBe(3);
      expect(summary.taken).toBe(2);
      expect(summary.percent).toBe(67);
      expect(summary.label).toBe("%67");
    });
  });

  describe("Turkish Clinical Text Normalization", () => {
    it("handles null, undefined, and empty string safely", () => {
      expect(normalizeClinicalText(null)).toBe("");
      expect(normalizeClinicalText(undefined)).toBe("");
      expect(normalizeClinicalText("")).toBe("");
    });

    it("correctly normalizes dotted and dotless Turkish I characters", () => {
      // Turkish: "İLAÇ" -> "ilaç", "IŞIK" -> "ışık"
      expect(normalizeClinicalText("İLAÇ")).toBe("ilaç");
      expect(normalizeClinicalText("IŞIK")).toBe("ışık");
      expect(normalizeClinicalText("İbuprofen")).toBe("ibuprofen");
      expect(normalizeClinicalText("Parol & Minoset")).toBe("parolminoset");
    });

    it("removes punctuation and extra whitespace for fuzzy search", () => {
      expect(normalizeClinicalText("  Atorvastatin + Ezetimib (20mg/10mg)! ")).toBe(
        "atorvastatinezetimib20mg10mg"
      );
    });
  });

  describe("Drug Interaction Severity Logic", () => {
    it("classifies severe interactions with error badge styling", () => {
      const pres = getSeverityPresentation("severe");
      expect(pres.label).toBe("KRİTİK KONTRENDİKASYON");
      expect(pres.badgeClass).toContain("text-error");
      expect(pres.containerClass).toContain("border-l-error");
    });

    it("classifies warning interactions with amber badge styling", () => {
      const pres = getSeverityPresentation("warning");
      expect(pres.label).toBe("ÖNEMLİ ETKİLEŞİM / DİKKAT");
      expect(pres.badgeClass).toContain("text-amber-700");
      expect(pres.containerClass).toContain("border-l-amber-500");
    });

    it("classifies unknown/info interactions safely", () => {
      const pres = getSeverityPresentation("mild");
      expect(pres.label).toBe("BİLGİLENDİRME");
      expect(pres.badgeClass).toContain("text-blue-700");
    });
  });

  describe("Chronotherapy Recommendations", () => {
    it("extracts ideal time and rationale from drug record", () => {
      const mockDrug: Partial<Drug> = {
        name: "Atorvastatin",
        chronotherapy: {
          idealTime: "20:30 (Akşam Yemeği Sonrası)",
          rationale: "HMG-CoA redüktaz sirkadiyen pik yapar.",
        },
      };
      const rec = getChronotherapyRecommendation(mockDrug as Drug);
      expect(rec.idealTime).toBe("20:30 (Akşam Yemeği Sonrası)");
      expect(rec.rationale).toContain("HMG-CoA redüktaz");
    });

    it("provides safe clinical fallback if chronotherapy is missing", () => {
      const rec = getChronotherapyRecommendation(null);
      expect(rec.idealTime).toContain("09:00");
      expect(rec.rationale).toBeDefined();
    });

    it("handles 0% adherence when all doses are pending", () => {
      const regimen: RegimenItem[] = [
        { id: "1", compound: "A", dose: "1", time: "1", note: "", status: "pending" },
        { id: "2", compound: "B", dose: "2", time: "2", note: "", status: "pending" },
      ];
      const summary = calculateAdherence(regimen);
      expect(summary.percent).toBe(0);
      expect(summary.taken).toBe(0);
      expect(summary.total).toBe(2);
      expect(summary.label).toBe("%0");
    });

    it("normalizes clinical compound search with multiple special characters", () => {
      expect(normalizeClinicalText("  Özel İlaç / Formülasyon #42 & Çinko - %50  ")).toBe(
        "özelilaçformülasyon42çinko50"
      );
    });
  });
});
