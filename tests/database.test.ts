import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Drug } from "../src/types";

describe("Clinical Medicine Database Expansion Integrity", () => {
  const drugsPath = path.resolve(__dirname, "../public/drugs.json");
  const rawData = fs.readFileSync(drugsPath, "utf-8");
  const drugs: Drug[] = JSON.parse(rawData);

  it("contains at least 510 medicines (increased by over 500 medicines from 10)", () => {
    expect(drugs.length).toBeGreaterThanOrEqual(510);
    // Baseline was 10, increased by 500 => at least 510
    expect(drugs.length - 10).toBeGreaterThanOrEqual(500);
  });

  it("ensures every medicine has a unique ID", () => {
    const ids = drugs.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("validates that all records strictly conform to the Drug interface", () => {
    for (const drug of drugs) {
      expect(drug.id).toBeTruthy();
      expect(typeof drug.name).toBe("string");
      expect(drug.name.length).toBeGreaterThan(0);

      expect(typeof drug.genericNameTR).toBe("string");
      expect(drug.genericNameTR.length).toBeGreaterThan(0);

      expect(typeof drug.genericNameUS).toBe("string");
      expect(drug.genericNameUS.length).toBeGreaterThan(0);

      expect(Array.isArray(drug.brandTR)).toBe(true);
      expect(drug.brandTR.length).toBeGreaterThan(0);

      expect(Array.isArray(drug.brandUS)).toBe(true);
      expect(drug.brandUS.length).toBeGreaterThan(0);

      expect(typeof drug.category).toBe("string");
      expect(typeof drug.rxType).toBe("string");
      expect(typeof drug.atc).toBe("string");
      expect(typeof drug.ndc).toBe("string");
      expect(typeof drug.titck).toBe("string");
      expect(typeof drug.description).toBe("string");

      // Pill geometry
      expect(drug.pillGeometry).toBeDefined();
      expect(drug.pillGeometry.shape).toBeDefined();
      expect(drug.pillGeometry.dimensions).toBeDefined();

      // Pharmacokinetics
      expect(drug.pharmacokinetics).toBeDefined();
      expect(drug.pharmacokinetics.tMax).toBeDefined();
      expect(drug.pharmacokinetics.halfLife).toBeDefined();

      // Interactions
      expect(Array.isArray(drug.interactions)).toBe(true);
      expect(drug.interactions.length).toBeGreaterThanOrEqual(1);

      // Chronotherapy
      expect(drug.chronotherapy).toBeDefined();
      expect(drug.chronotherapy.idealTime).toBeDefined();
      expect(drug.chronotherapy.rationale).toBeDefined();
    }
  });

  it("successfully finds prominent newly added medicines by generic and brand names", () => {
    const searchQueries = [
      "Rosuvastatin",
      "Crestor",
      "Siprofloksasin",
      "Cipro",
      "Pantoprazol",
      "Nexium",
      "Rivaroksaban",
      "Xarelto",
      "Essitalopram",
      "Cipralex",
      "Montelukast",
      "Singulair",
      "Naproksen",
      "Apranax",
      "Metoprolol",
      "Beloc",
    ];

    for (const query of searchQueries) {
      const lower = query.toLowerCase();
      const match = drugs.find(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.genericNameTR.toLowerCase().includes(lower) ||
          d.genericNameUS.toLowerCase().includes(lower) ||
          d.brandTR.some((b) => b.toLowerCase().includes(lower)) ||
          d.brandUS.some((b) => b.toLowerCase().includes(lower))
      );
      expect(match, `Expected to find a medicine matching query: "${query}"`).toBeDefined();
    }
  });
});
