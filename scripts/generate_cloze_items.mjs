/**
 * Builds the materials for the cloze comprehension protocol.
 *
 *   npm run measure:cloze
 *
 * Selects 15 drugs from the citation-verified gold set, round-robin across
 * distinct top-level ATC classes, and produces a cloze-deletion passage from
 * each drug's technical description and from its plain-language summary.
 * See analysis/CLOZE_PROTOCOL.md for the design this implements — this
 * script only builds the materials; it does not collect or score responses.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isVerifiedAtc } from "../src/utils/provenance.ts";
import { buildPlainSummary } from "../src/utils/plainLanguage.ts";
import { GOLD_CITATIONS } from "../src/data/goldCitations.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = path.join(ROOT, "public", "drugs.json");
const OUT_DIR = path.join(ROOT, "analysis");
const OUT_JSON = path.join(OUT_DIR, "cloze-items.json");
const OUT_PRINT = path.join(OUT_DIR, "cloze-items-print.md");

const ITEM_COUNT = 15;

/** Picks up to `count` drugs, round-robin across distinct top-level ATC classes. */
function pickAcrossClasses(drugs, count) {
  const byClass = new Map();
  for (const d of [...drugs].sort((a, b) => a.id.localeCompare(b.id))) {
    const cls = d.atc[0];
    if (!byClass.has(cls)) byClass.set(cls, []);
    byClass.get(cls).push(d);
  }
  const classes = [...byClass.keys()].sort();

  const picked = [];
  for (let round = 0; picked.length < count; round++) {
    let addedThisRound = false;
    for (const cls of classes) {
      const bucket = byClass.get(cls);
      if (bucket[round]) {
        picked.push(bucket[round]);
        addedThisRound = true;
        if (picked.length === count) break;
      }
    }
    if (!addedThisRound) break;
  }
  return picked;
}

function tokenize(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

/**
 * Mechanical, content-blind cloze deletion: every 5th word starting at the
 * 3rd word for passages of 15+ words; every 4th word starting at the 2nd
 * word for shorter passages, so short plain-language sentences still yield
 * a handful of blanks. See CLOZE_PROTOCOL.md "Materials".
 */
function makeCloze(text) {
  const words = tokenize(text);
  const long = words.length >= 15;
  const step = long ? 5 : 4;
  const start = long ? 2 : 1; // 0-indexed

  const blanks = [];
  const displayWords = words.map((word, i) => {
    if (i >= start && (i - start) % step === 0) {
      const answer = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      blanks.push({ index: blanks.length, wordPosition: i, answer });
      return `[__${blanks.length}__]`;
    }
    return word;
  });

  return {
    sourceText: text,
    clozeText: displayWords.join(" "),
    blanks,
  };
}

function buildPassage(drug, layer) {
  const text =
    layer === "technical"
      ? drug.description
      : (() => {
          const plain = buildPlainSummary(drug);
          return plain ? `${plain.purpose} ${plain.howToTake}` : null;
        })();
  if (!text) return null;
  return { drugId: drug.id, atc: drug.atc, layer, ...makeCloze(text) };
}

const drugs = JSON.parse(fs.readFileSync(CORPUS, "utf-8"));
const goldSet = drugs.filter(
  (d) => isVerifiedAtc(d.atc) && GOLD_CITATIONS[d.id] && buildPlainSummary(d)
);

const selected = pickAcrossClasses(goldSet, ITEM_COUNT);
if (selected.length < ITEM_COUNT) {
  console.warn(
    `Only found ${selected.length} eligible drugs (need ${ITEM_COUNT}). Materials will be shorter than the protocol calls for.`
  );
}

const items = selected.map((drug, i) => {
  const technical = buildPassage(drug, "technical");
  const plain = buildPassage(drug, "plain");
  // Even index: Form A gets technical, Form B gets plain. Odd: reversed.
  // See CLOZE_PROTOCOL.md "Design".
  const evenIndex = i % 2 === 0;
  return {
    itemId: `${drug.id}`,
    drugId: drug.id,
    atc: drug.atc,
    formA: evenIndex ? technical : plain,
    formB: evenIndex ? plain : technical,
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  protocol: "analysis/CLOZE_PROTOCOL.md",
  itemCount: items.length,
  items,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2) + "\n");

// Researcher-facing printable version, WITH the answer key. Strip the
// "beklenen:" line before handing a form to an actual participant.
const printLines = [
  "# Cloze materials (researcher copy — includes answer key)",
  "",
  "Generated from `npm run measure:cloze`. See CLOZE_PROTOCOL.md before use.",
  "",
];
for (const item of items) {
  printLines.push(`## ${item.itemId} (${item.atc})`, "");
  for (const [formName, passage] of [
    ["Form A", item.formA],
    ["Form B", item.formB],
  ]) {
    if (!passage) continue;
    printLines.push(`**${formName} — ${passage.layer}**`, "", passage.clozeText, "");
    const key = passage.blanks.map((b) => `${b.index + 1}=${b.answer}`).join(", ");
    printLines.push(`_beklenen: ${key}_`, "");
  }
}
fs.writeFileSync(OUT_PRINT, printLines.join("\n") + "\n");

console.log(`Cloze items  : ${items.length} drugs, ${OUT_JSON.replace(ROOT + path.sep, "")}`);
console.log(`Printable    : ${OUT_PRINT.replace(ROOT + path.sep, "")}`);
