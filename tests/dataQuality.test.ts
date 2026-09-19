import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Drug } from "../src/types/index.ts";
import {
  countSyllables,
  scoreReadability,
  summarizeCorpus,
  tokenizeWords,
} from "../src/utils/readability.ts";
import { isVerifiedAtc, getDrugProvenance, summarizeProvenance } from "../src/utils/provenance.ts";
import { buildPlainSummary, coveredAtcGroups } from "../src/utils/plainLanguage.ts";

const drugs: Drug[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../public/drugs.json"), "utf-8")
);

describe("Turkish readability metrics", () => {
  it("counts syllables as vowels, which is exact in Turkish", () => {
    expect(countSyllables("ilaç")).toBe(2);
    expect(countSyllables("kolesterol")).toBe(4);
    expect(countSyllables("kardiyovasküler")).toBe(6);
    // Vowel-exact by design: the "O" in a formula is oxygen, but countSyllables
    // only knows letters. Excluding formulas is tokenizeWords' job, not this one.
    expect(countSyllables("C22H28FN3O6S")).toBe(1);
    expect(countSyllables("PRN")).toBe(0);
  });

  it("drops vowel-less tokens so chemical formulas cannot flatter the score", () => {
    expect(tokenizeWords("Atorvastatin C33H35FN2O5 tablet")).toEqual(["Atorvastatin", "tablet"]);
  });

  it("scores a short plain sentence as easy", () => {
    const r = scoreReadability("Bu ilaç kan şekerinizi düşürür. Yemekle birlikte alın.");
    expect(r.atesman).toBeGreaterThan(70);
    expect(r.band === "kolay" || r.band === "çok kolay").toBe(true);
  });

  it("scores a dense clinical sentence as very difficult", () => {
    const r = scoreReadability(
      "HMG-CoA redüktaz enzim blokajı ve intestinal NPC1L1 kolesterol taşıyıcı " +
        "inhibisyonu ile primer hiperlipidemi ve kardiyovasküler risk azaltımında " +
        "sinerjistik etki sağlar."
    );
    expect(r.atesman).toBeLessThan(30);
    expect(r.band).toBe("çok zor");
  });

  it("returns a zeroed result instead of NaN for empty input", () => {
    const r = scoreReadability("");
    expect(r.words).toBe(0);
    expect(Number.isNaN(r.atesman)).toBe(false);
  });

  it("summarises a corpus without counting unscoreable entries", () => {
    const s = summarizeCorpus(["Bu ilaç ağrıyı keser.", "", "C22H28"]);
    expect(s.count).toBe(1);
  });
});

describe("Corpus readability: the problem this project is about", () => {
  const technical = summarizeCorpus(drugs.map((d) => d.description));

  it("shows the shipped technical descriptions are unreadable for patients", () => {
    // Documents the baseline rather than asserting a target: if someone rewrites
    // the corpus this test should be updated deliberately, not silently pass.
    expect(technical.count).toBe(drugs.length);
    expect(technical.medianAtesman).toBeLessThan(20);
    expect(technical.bands["çok kolay"] + technical.bands["kolay"]).toBe(0);
  });

  it("shows the plain-language layer is measurably easier", () => {
    const plain = summarizeCorpus(
      drugs
        .map((d) => buildPlainSummary(d))
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map((p) => `${p.purpose} ${p.howToTake}`)
    );

    expect(plain.count).toBeGreaterThan(0);
    expect(plain.medianAtesman).toBeGreaterThan(70);
    expect(plain.bands["zor"] + plain.bands["çok zor"]).toBe(0);
    expect(plain.medianAtesman - technical.medianAtesman).toBeGreaterThan(40);
  });
});

describe("Per-field provenance", () => {
  it("accepts a real WHO ATC code and rejects the generator's shape", () => {
    expect(isVerifiedAtc("C10AA07")).toBe(true);
    expect(isVerifiedAtc("A02BC01")).toBe(true);
    // scripts/generate_drugs.mjs emits this 6-character form from a counter.
    expect(isVerifiedAtc("N02A11")).toBe(false);
    expect(isVerifiedAtc("")).toBe(false);
    expect(isVerifiedAtc(undefined)).toBe(false);
  });

  it("records that most of the shipped corpus cannot be verified", () => {
    const summary = summarizeProvenance(drugs);
    expect(summary.total).toBe(drugs.length);
    expect(summary.verified).toBeGreaterThan(0);
    expect(summary.unverified).toBeGreaterThan(summary.verified);
    expect(summary.verified + summary.unverified).toBe(summary.total);
  });

  it("offers lookup links only for records whose class is real", () => {
    const verified = drugs.find((d) => isVerifiedAtc(d.atc));
    const unverified = drugs.find((d) => !isVerifiedAtc(d.atc));
    expect(verified && unverified).toBeTruthy();

    const good = getDrugProvenance(verified!);
    expect(good.status).toBe("verified");
    expect(good.fields.every((f) => f.lookupUrl !== null)).toBe(true);

    const bad = getDrugProvenance(unverified!);
    expect(bad.status).toBe("unverified");
    expect(bad.fields.every((f) => f.lookupUrl === null)).toBe(true);
    expect(bad.notice).toContain("GERÇEK DEĞİLDİR");
  });
});

describe("Plain-language layer", () => {
  it("refuses to describe a drug whose therapeutic class was invented", () => {
    const unverified = drugs.filter((d) => !isVerifiedAtc(d.atc));
    expect(unverified.length).toBeGreaterThan(0);
    for (const drug of unverified) {
      expect(buildPlainSummary(drug)).toBeNull();
    }
  });

  it("covers every verified record in the corpus", () => {
    const verified = drugs.filter((d) => isVerifiedAtc(d.atc));
    const uncovered = verified.filter((d) => buildPlainSummary(d) === null);
    expect(
      uncovered.map((d) => `${d.id}/${d.atc}`),
      "verified drugs with no plain-language entry"
    ).toEqual([]);
  });

  it("writes in the second person and records what it was derived from", () => {
    const statin = drugs.find((d) => d.atc.startsWith("C10AA"));
    const plain = buildPlainSummary(statin!);
    expect(plain).not.toBeNull();
    expect(plain!.purpose).toMatch(/nız|niz|siz|sınız/);
    expect(plain!.derivedFrom).toBe("C10AA");
  });

  it("keeps every lexicon entry short enough to stay readable", () => {
    expect(coveredAtcGroups().length).toBeGreaterThan(30);
    for (const group of coveredAtcGroups()) {
      const sample = drugs.find((d) => d.atc.startsWith(group));
      if (!sample) continue;
      const plain = buildPlainSummary(sample);
      if (!plain) continue;
      expect(scoreReadability(plain.purpose).atesman).toBeGreaterThan(55);
    }
  });
});
