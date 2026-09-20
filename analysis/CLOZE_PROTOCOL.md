# Cloze comprehension protocol

**Status: protocol defined, materials generated, no data collected yet.** This
document exists to close the gap the project has stated openly since its
first honest rebuild: the Ateşman/Bezirci-Yılmaz readability scores in the
README show the plain-language layer is more *readable* than the technical
layer. They do not show a real patient understands it better. That claim
needs a human comprehension test. This is that test's design.

## Research question

Do Turkish-speaking readers correctly reconstruct more deleted words from the
**plain-language layer** than from the **technical description layer**, for
the same set of drugs?

This is the classic cloze procedure (Taylor, 1953): delete words from a text
at a fixed interval, ask a reader to fill each blank, and use the fraction of
blanks filled correctly as a proxy for how comprehensible the text was to
that reader. It's an established substitute for asking "did you understand
this," which readers answer unreliably about their own comprehension.

## Materials

- **Source:** the 15 drugs selected by
  [`scripts/generate_cloze_items.mjs`](../scripts/generate_cloze_items.mjs)
  from the citation-verified gold set (`src/data/goldCitations.ts`), chosen
  round-robin across distinct top-level ATC classes so the sample isn't all
  statins. Deterministic and reproducible — re-running the script on an
  unchanged corpus produces the same 15 drugs.
- **Two layers per drug:** the technical layer is `drug.description` (the
  existing monograph text). The plain layer is `purpose + " " + howToTake`
  from `buildPlainSummary()`. Both describe the same drug; neither is
  written for this test.
- **Cloze deletion rule:** every 5th word is deleted, starting from the 3rd
  word, for passages of 15 words or more. Short passages (under 15 words,
  common in the plain layer) use every 4th word starting from the 2nd word,
  so short plain-language sentences still yield at least 3 blanks. This is a
  mechanical, content-blind rule — it does not hand-pick "important" words —
  because hand-picking is exactly the kind of researcher judgment call a
  cloze test is meant to avoid.
- **Output:** `analysis/cloze-items.json` (machine-readable, blanks and
  answer keys included) and `analysis/cloze-items-print.md` (a
  researcher-facing printable version — not for handing to participants
  as-is, since it includes the answer key; strip the key before printing a
  participant form).

## Design

**Within-subject on drug, between-condition on layer, counterbalanced.** Each
participant sees all 15 drugs, but for any given drug they see **either** the
technical passage **or** the plain passage — never both, to avoid a learning
effect where reading the plain version first makes the technical blank
easier to guess. Across the sample, each drug appears in the technical
condition for roughly half of participants and in the plain condition for
the other half.

The generator script implements this as two fixed forms:

- **Form A:** technical passage for even-indexed drugs, plain passage for
  odd-indexed drugs.
- **Form B:** the complement — plain passage for even-indexed drugs,
  technical passage for odd-indexed drugs.

Assign incoming participants to Form A or Form B alternately (or by a coin
flip) as they arrive. Record which form each participant received in the
CSV (`form` column).

## Participants

- **Target n: 20–40.** Adult, native or fluent Turkish speakers, literate.
- **Exclude health professionals** (physicians, pharmacists, nurses, medical
  students) — the question is lay comprehension, and clinical training
  would let someone fill technical blanks from background knowledge rather
  than from the text itself.
- Convenience sample is acceptable and expected for a project at this
  stage; report it as such, not as a representative sample.

## Procedure

1. Participant reads a short instruction (below), then works through their
   assigned form's 15 passages in order, filling each blank with the single
   word they think belongs there. No time limit; no dictionary or outside
   help.
2. Suggested Turkish instruction text:
   > "Aşağıda 15 kısa metin göreceksiniz. Her metinde bazı kelimeler
   > silinmiş ve yerine boşluk bırakılmıştır. Metnin anlamına göre, o
   > boşluğa göre en uygun **tek kelimeyi** yazın. Doğru veya yanlış
   > olduğunu düşünmeyin; sadece anlama göre tahmin edin."
3. Collect responses into the CSV template
   (`analysis/cloze-responses.template.csv`), one row per blank.

## Consent and ethics

- Participation is voluntary and anonymous. Collect no name, no contact
  info, and no identifying detail beyond `participant_id` (a number you
  assign, not traceable to the person).
- State plainly before starting that this is a student research project
  about medication-label readability, not a medical test, and that
  responses will only be used in aggregate.
- This protocol has not been reviewed by a formal IRB/ethics board — it is
  a low-risk, anonymous, adult convenience-sample study, but say so
  explicitly in any write-up rather than implying formal review occurred.

## Scoring

Score each blank independently:

- **1 point** — exact match to the deleted word (case-insensitive, ignoring
  trailing punctuation).
- **0.5 point** — an acceptable synonym or a correct inflection of the same
  root (e.g. `alınmalı` for `alınır`). Judged by whoever scores the CSV;
  record the judgment call in the `notes` column so it's auditable, not
  silent.
- **0 points** — anything else, including a blank left empty.

Per-participant score per layer = sum of points / number of blanks in that
layer's passages they attempted. Per-item score = mean across participants
who saw that item.

## Analysis plan

- Report median and IQR of per-layer score across participants (technical
  vs. plain), the same way the readability numbers are reported —
  distributions, not just a mean.
- Because each participant contributes both a technical-condition score
  (on some drugs) and a plain-condition score (on the others), this is a
  within-subject comparison: use a paired test (Wilcoxon signed-rank,
  given the expected small n) rather than an unpaired one.
- Report the result honestly even if n turns out too small for the test to
  reach significance — the point of running this at all is that an
  unmeasured claim is worse than a small measured one, which is the same
  argument the project already makes about the readability scores.

## Known limitations of this protocol

- n=20–40 is small; treat results as a pilot signal, not a proof.
- Convenience sample, not randomized or demographically representative.
- Single-rater scoring for the synonym-credit judgment call introduces
  some subjectivity; a second rater would strengthen this later.
- Cloze accuracy measures word-level reconstruction, which correlates with
  but is not identical to comprehension of clinical meaning (e.g., a
  participant could fill a blank correctly from local syntax without
  understanding the drug's purpose). This is a known limitation of the
  cloze method itself, not specific to this application of it.
