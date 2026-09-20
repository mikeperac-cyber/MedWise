/**
 * Per-field provenance for the drug corpus.
 *
 * Context, stated plainly because it matters: 537 of the 593 records in
 * `public/drugs.json` were produced by `scripts/generate_drugs.mjs`, which
 * synthesises ATC, NDC and TİTCK identifiers from a loop counter
 * (see the `atcCode` template in that script). The drug *names* are real; those
 * three identifier fields are not, and neither is the therapeutic class implied
 * by a fabricated ATC code.
 *
 * This module does not delete anything. It classifies each identifier field as
 * `verified` or `unverified` so the UI can label it, and it builds *lookup*
 * links into the official registries. A lookup link is a place for the reader to
 * go and check — it is deliberately NOT presented as a citation, because nobody
 * has checked it yet.
 *
 * Downstream rule enforced by `plainLanguage.ts`: a patient-facing plain-Turkish
 * summary is only ever generated from a `verified` therapeutic class. We do not
 * guess a drug's purpose from an invented code.
 */

import type { Drug } from "../types/index.ts";
import { GOLD_CITATIONS, type GoldCitation } from "../data/goldCitations.ts";

/**
 * A real WHO ATC code is 7 characters: anatomical letter, two digits,
 * therapeutic letter, pharmacological letter, two digits. Example: C10AA07.
 *
 * The generator emits a 6-character shape (letter, two digits, "A", two digits)
 * such as `N02A11`, which is why a simple shape test separates the curated
 * records from the synthesised ones.
 */
export const ATC_PATTERN = /^[A-Z][0-9]{2}[A-Z]{2}[0-9]{2}$/;

export type ProvenanceStatus = "verified" | "unverified";

export interface FieldProvenance {
  /** Machine name of the field, e.g. "atc". */
  field: string;
  /** Turkish label shown next to the value. */
  label: string;
  /** The stored value, shown as-is. */
  value: string;
  status: ProvenanceStatus;
  /** Where a reader can go to check this value themselves. Null when unknown. */
  lookupUrl: string | null;
}

export interface DrugProvenance {
  /** True only when the ATC code is structurally a real WHO code. */
  atcVerified: boolean;
  /**
   * Whole-record verdict. `verified` means the therapeutic classification can be
   * trusted enough to derive patient-facing text from it.
   */
  status: ProvenanceStatus;
  fields: FieldProvenance[];
  /** Turkish sentence describing the record's standing, for the UI banner. */
  notice: string;
  /**
   * Present only when this record's ATC code was hand-checked against a real
   * registry document (see src/data/goldCitations.ts), not just shape-matched.
   * This is a strictly stronger claim than `atcVerified` alone.
   */
  citation: GoldCitation | null;
}

/** Structural check for a real WHO ATC code. */
export function isVerifiedAtc(atc: string | null | undefined): boolean {
  return typeof atc === "string" && ATC_PATTERN.test(atc.trim());
}

/**
 * Official registry search endpoints.
 *
 * These are search entry points, not deep links to a specific label, because we
 * do not hold a verified document id for any record. Presenting them as "go and
 * check for yourself" is the honest framing.
 */
function atcLookupUrl(atc: string): string {
  return `https://atcddd.fhi.no/atc_ddd_index/?code=${encodeURIComponent(atc)}`;
}

function ndcLookupUrl(ndc: string): string {
  return `https://dps.fda.gov/ndc/searchresult?selection=finished&content=PACKAGENDC&type=${encodeURIComponent(ndc)}`;
}

function titckLookupUrl(genericName: string): string {
  return `https://www.titck.gov.tr/kubkt?search=${encodeURIComponent(genericName)}`;
}

const VERIFIED_NOTICE =
  "Bu kaydın ATC sınıf kodu geçerli WHO biçimindedir. Yine de aşağıdaki bağlantılardan kendiniz doğrulayabilirsiniz.";

const UNVERIFIED_NOTICE =
  "DİKKAT: Bu kaydın ATC, NDC ve TİTCK numaraları proje veri üreticisi tarafından otomatik üretilmiştir ve GERÇEK DEĞİLDİR. Sadece ilaç adı gerçektir. Bu numaralara dayanarak hiçbir klinik karar vermeyiniz.";

function citedNotice(citation: GoldCitation): string {
  const registryPart = citation.labelSource ? ` ve ${citation.labelSource.registry}` : "";
  return `Bu kaydın ATC sınıf kodu WHO ATC/DDD Index${registryPart} üzerinden ${citation.verifiedOn} tarihinde elle doğrulandı. Kaynaklar aşağıdadır.`;
}

/**
 * Classifies every identifier field on a record.
 *
 * The ATC code drives the whole-record verdict because it is the only field that
 * carries therapeutic meaning; NDC and TİTCK are opaque registration numbers, so
 * they inherit the record's status rather than being checkable on their own.
 */
export function getDrugProvenance(drug: Drug): DrugProvenance {
  const atcVerified = isVerifiedAtc(drug.atc);
  const status: ProvenanceStatus = atcVerified ? "verified" : "unverified";
  const citation = atcVerified ? (GOLD_CITATIONS[drug.id] ?? null) : null;

  const fields: FieldProvenance[] = [
    {
      field: "atc",
      label: "ATC sınıf kodu",
      value: drug.atc,
      status,
      lookupUrl: atcVerified ? atcLookupUrl(drug.atc) : null,
    },
    {
      field: "ndc",
      label: "FDA NDC numarası",
      value: drug.ndc,
      status,
      lookupUrl: atcVerified ? ndcLookupUrl(drug.ndc) : null,
    },
    {
      field: "titck",
      label: "TİTCK ruhsat numarası",
      value: drug.titck,
      status,
      lookupUrl: atcVerified ? titckLookupUrl(drug.genericNameTR) : null,
    },
  ];

  return {
    atcVerified,
    status,
    fields,
    notice: citation ? citedNotice(citation) : atcVerified ? VERIFIED_NOTICE : UNVERIFIED_NOTICE,
    citation,
  };
}

export interface CorpusProvenanceSummary {
  total: number;
  verified: number;
  unverified: number;
  /** Percentage of records whose identifiers are synthesised, 0-100. */
  unverifiedPercent: number;
}

/** Corpus-wide counts, rendered on the Akademik Portföy page. */
export function summarizeProvenance(drugs: Drug[]): CorpusProvenanceSummary {
  const verified = drugs.filter((d) => isVerifiedAtc(d.atc)).length;
  const total = drugs.length;
  const unverified = total - verified;
  return {
    total,
    verified,
    unverified,
    unverifiedPercent: total === 0 ? 0 : Math.round((unverified / total) * 1000) / 10,
  };
}

export interface CitationSummary {
  /** Shape-verified count (same as CorpusProvenanceSummary.verified). */
  verified: number;
  /** Of those, how many carry a hand-checked registry citation. */
  cited: number;
}

/** How much of the shape-verified subset is actually backed by a citation. */
export function summarizeCitations(drugs: Drug[]): CitationSummary {
  const verifiedDrugs = drugs.filter((d) => isVerifiedAtc(d.atc));
  const cited = verifiedDrugs.filter((d) => GOLD_CITATIONS[d.id]).length;
  return { verified: verifiedDrugs.length, cited };
}
