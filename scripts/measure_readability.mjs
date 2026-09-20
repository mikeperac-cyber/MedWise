/**
 * Measures the drug corpus and writes a dated report.
 *
 *   npm run measure:readability
 *
 * The report is the project's primary evidence artifact: it records how hard
 * the shipped text is to read, how much of the corpus can be verified, and what
 * the plain-language layer changes. Committing it over time turns "I made it
 * clearer" into something a reader can check.
 *
 * This imports the same modules the browser uses — no duplicated formula — by
 * relying on Node's native TypeScript stripping plus the explicit .ts
 * specifiers enabled in tsconfig.json.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { summarizeCorpus, scoreReadability } from "../src/utils/readability.ts";
import { summarizeProvenance, summarizeCitations, isVerifiedAtc } from "../src/utils/provenance.ts";
import { buildPlainSummary } from "../src/utils/plainLanguage.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = path.join(ROOT, "public", "drugs.json");
const OUT_DIR = path.join(ROOT, "analysis");
const OUT_FILE = path.join(OUT_DIR, "readability-report.json");

const drugs = JSON.parse(fs.readFileSync(CORPUS, "utf-8"));

const verified = drugs.filter((d) => isVerifiedAtc(d.atc));
const plainTexts = verified
  .map((d) => buildPlainSummary(d))
  .filter(Boolean)
  .map((p) => `${p.purpose} ${p.howToTake}`);

const report = {
  generatedAt: new Date().toISOString(),
  corpusFile: path.relative(ROOT, CORPUS).replace(/\\/g, "/"),
  provenance: summarizeProvenance(drugs),
  citations: summarizeCitations(drugs),
  technicalDescriptions: summarizeCorpus(drugs.map((d) => d.description)),
  technicalDescriptionsVerifiedSubset: summarizeCorpus(verified.map((d) => d.description)),
  interactionWarnings: summarizeCorpus(
    drugs.flatMap((d) => (d.interactions ?? []).map((i) => i.description)).filter(Boolean)
  ),
  plainLanguageSummaries: summarizeCorpus(plainTexts),
  worstOffenders: drugs
    .map((d) => ({ id: d.id, atesman: scoreReadability(d.description).atesman }))
    .sort((a, b) => a.atesman - b.atesman)
    .slice(0, 10),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2) + "\n");

const t = report.technicalDescriptions;
const p = report.plainLanguageSummaries;
const pr = report.provenance;

console.log(`Corpus       : ${pr.total} records (${pr.verified} verified, ${pr.unverified} not)`);
console.log(
  `Citations    : ${report.citations.cited}/${report.citations.verified} shape-verified records have a real registry citation`
);
console.log(`Technical    : median Ateşman ${t.medianAtesman}  [${JSON.stringify(t.bands)}]`);
console.log(`Plain layer  : median Ateşman ${p.medianAtesman}  [${JSON.stringify(p.bands)}]`);
console.log(`Report       : ${path.relative(ROOT, OUT_FILE).replace(/\\/g, "/")}`);
