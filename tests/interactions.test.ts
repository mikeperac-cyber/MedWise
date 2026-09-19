import { describe, it, expect } from "vitest";
import { checkDrugInteractions } from "../src/services/interactions";
import type { Drug } from "../src/types";

describe("Clinical Drug-Drug Interaction Checking Engine", () => {
  const dummyAtorvastatin = {
    id: "atorvastatin",
    name: "Atorvastatin Kalsiyum",
    genericNameTR: "Atorvastatin",
    genericNameUS: "Atorvastatin Calcium",
    atc: "C10AA05",
    rxType: "Reçeteli",
    ndc: "0071-0156-23",
    titck: "TR TİTCK",
    dosageForms: "Oral Tablet",
    brandTR: ["Lipitor", "Ator", "Kolestor"],
    brandUS: ["Lipitor"],
    formula: "C33H35FN2O5",
    chirality: "(3R, 5R)",
    pillGeometry: {
      shape: "Oval",
      colorLeft: "#ffdad5",
      colorRight: "#fddbd6",
      textLeft: "ATOR",
      textRight: "20",
      imprint: "AT20",
      dimensions: "14.2mm x 7.1mm",
    },
    pharmacokinetics: {
      tMax: "1-2 saat",
      halfLife: "14 saat",
      bioavailability: "%14",
      metabolismPathway: "Sitokrom P450 3A4 substratı",
      clearance: "Hepatik safra (%98)",
    },
    interactions: [],
  } as unknown as Drug;

  const dummyClarithromycin = {
    id: "clarithromycin",
    name: "Klaritromisin",
    genericNameTR: "Klaritromisin",
    genericNameUS: "Clarithromycin",
    atc: "J01FA09",
    rxType: "Reçeteli",
    ndc: "0074-3331-60",
    titck: "TR TİTCK",
    dosageForms: "Oral Tablet",
    brandTR: ["Klacid", "Klaromin", "Macrol"],
    brandUS: ["Biaxin"],
    formula: "C38H69NO13",
    chirality: "(2R, 3S, 4S, 5R)",
    pillGeometry: {
      shape: "Oval",
      colorLeft: "#ffe2dd",
      colorRight: "#fff0ee",
      textLeft: "KLAC",
      textRight: "500",
      imprint: "KL500",
      dimensions: "18.0mm x 8.5mm",
    },
    pharmacokinetics: {
      tMax: "2-3 saat",
      halfLife: "5-7 saat",
      bioavailability: "%50",
      metabolismPathway: "Güçlü Sitokrom P450 3A4 inhibitörü ve substratı",
      clearance: "Renal ve hepatik",
    },
    interactions: [],
  } as unknown as Drug;

  const dummyRivaroxaban = {
    id: "rivaroxaban",
    name: "Rivaroksaban",
    genericNameTR: "Rivaroksaban",
    genericNameUS: "Rivaroxaban",
    atc: "B01AF01",
    rxType: "Reçeteli",
    ndc: "50458-578-30",
    titck: "TR TİTCK",
    dosageForms: "Film Kaplı Tablet",
    brandTR: ["Xarelto", "Rixaban"],
    brandUS: ["Xarelto"],
    formula: "C19H18ClN3O5S",
    chirality: "(S)",
    pillGeometry: {
      shape: "Yuvarlak",
      colorLeft: "#ffdad5",
      colorRight: "#ffe9e6",
      textLeft: "XA",
      textRight: "20",
      imprint: "X20",
      dimensions: "6.0mm",
    },
    pharmacokinetics: {
      tMax: "2-4 saat",
      halfLife: "5-9 saat",
      bioavailability: "%80-100",
      metabolismPathway: "CYP3A4 ve P-gp substratı",
      clearance: "Renal (%66) ve fekal",
    },
    interactions: [],
  } as unknown as Drug;

  const dummyDiclofenac = {
    id: "diclofenac",
    name: "Diklofenak Sodyum",
    genericNameTR: "Diklofenak",
    genericNameUS: "Diclofenac Sodium",
    atc: "M01AB05",
    rxType: "Reçeteli",
    ndc: "0078-0437-05",
    titck: "TR TİTCK",
    dosageForms: "Enterik Tablet",
    brandTR: ["Voltaren", "Diclomec", "Miyadren"],
    brandUS: ["Voltaren", "Cataflam"],
    formula: "C14H10Cl2NNaO2",
    chirality: "Akiral",
    pillGeometry: {
      shape: "Yuvarlak",
      colorLeft: "#ffe2dd",
      colorRight: "#fddbd6",
      textLeft: "VOLT",
      textRight: "50",
      imprint: "V50",
      dimensions: "7.0mm",
    },
    pharmacokinetics: {
      tMax: "1.5-2.5 saat",
      halfLife: "1-2 saat",
      bioavailability: "%50",
      metabolismPathway: "CYP2C9 substratı (NSAİİ)",
      clearance: "Biliyer ve renal",
    },
    interactions: [],
  } as unknown as Drug;

  it("handles less than 2 drugs safely", () => {
    const resEmpty = checkDrugInteractions([]);
    expect(resEmpty.totalInteractions).toBe(0);
    expect(resEmpty.maxSeverity).toBe("none");

    const resSingle = checkDrugInteractions([dummyAtorvastatin]);
    expect(resSingle.totalInteractions).toBe(0);
    expect(resSingle.maxSeverity).toBe("none");
  });

  it("identifies critical CYP3A4 inhibition between Atorvastatin and Clarithromycin", () => {
    const analysis = checkDrugInteractions([dummyAtorvastatin, dummyClarithromycin]);
    expect(analysis.totalInteractions).toBeGreaterThanOrEqual(1);
    expect(analysis.maxSeverity).toBe("critical");

    const cypMatch = analysis.interactions.find(
      (i) => i.category === "CYP450" && i.severity === "critical"
    );
    expect(cypMatch).toBeDefined();
    expect(cypMatch?.title).toContain("Hepatik CYP3A4 İnhibisyonu");
    expect(cypMatch?.mechanism).toContain("AUC");
  });

  it("identifies severe bleeding risk between Rivaroxaban (DOAC) and Diclofenac (NSAID)", () => {
    const analysis = checkDrugInteractions([dummyRivaroxaban, dummyDiclofenac]);
    expect(analysis.totalInteractions).toBeGreaterThanOrEqual(1);
    expect(analysis.maxSeverity).toBe("severe");

    const bleedMatch = analysis.interactions.find((i) => i.category === "Kanama Riski");
    expect(bleedMatch).toBeDefined();
    expect(bleedMatch?.clinicalAction).toContain("proton pompa inhibitörü");
  });

  it("evaluates multi-drug combinations with 3 or more drugs", () => {
    const analysis = checkDrugInteractions([
      dummyAtorvastatin,
      dummyClarithromycin,
      dummyRivaroxaban,
      dummyDiclofenac,
    ]);
    expect(analysis.drugsAnalyzed.length).toBe(4);
    expect(analysis.totalInteractions).toBeGreaterThanOrEqual(2);
    expect(analysis.maxSeverity).toBe("critical");
  });
});
