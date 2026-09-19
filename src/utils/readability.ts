/**
 * Turkish readability metrics.
 *
 * Why this module exists: MedWise is aimed at people who struggle to understand
 * their own medications, so "is this text actually readable" has to be a number
 * we can track, not a feeling. Every patient-facing string in the drug corpus is
 * scored by `npm run measure:readability`, and the Akademik Portföy page renders
 * the resulting distribution.
 *
 * Two published formulas are implemented:
 *
 *  - Ateşman (1997), a Flesch adaptation for Turkish. Returns 0-100, higher is
 *    easier. Ateşman, E. "Türkçede okunabilirliğin ölçülmesi."
 *    Dil Dergisi 58 (1997): 71-74.
 *
 *  - Bezirci-Yılmaz (2010), which returns an approximate number of years of
 *    formal education required. Bezirci, B. & Yılmaz, A. E. "Metinlerin
 *    okunabilirliği ölçmede yeni bir yöntem." Journal of Naval Science and
 *    Engineering 6(1) (2010): 1-19.
 *
 * Turkish orthography makes syllable counting exact rather than heuristic: every
 * Turkish syllable contains exactly one vowel, so syllables == vowel count. That
 * is why these formulas are reliable here in a way an English syllable estimator
 * would not be.
 */

/** The eight Turkish vowels, lower and upper case. */
const TURKISH_VOWELS = "aeıioöuüAEIİOÖUÜ";

/** Sentence terminators. Turkish uses the same set as English here. */
const SENTENCE_BOUNDARY = /[.!?…]+/;

export type ReadabilityBand = "çok kolay" | "kolay" | "orta" | "zor" | "çok zor";

export interface ReadabilityResult {
  /** Total syllables (== vowel count). */
  syllables: number;
  /** Total word tokens. */
  words: number;
  /** Total sentences (minimum 1 for any non-empty text). */
  sentences: number;
  /** Mean syllables per word. */
  syllablesPerWord: number;
  /** Mean words per sentence. */
  wordsPerSentence: number;
  /** Ateşman score, 0-100. Higher is easier. */
  atesman: number;
  /** Bezirci-Yılmaz score, approximate years of schooling required. */
  bezirciYilmaz: number;
  /** Human-facing band derived from the Ateşman score. */
  band: ReadabilityBand;
}

/** Counts syllables in a Turkish token by counting its vowels. */
export function countSyllables(word: string): number {
  let count = 0;
  for (const char of word) {
    if (TURKISH_VOWELS.includes(char)) count++;
  }
  return count;
}

/**
 * Splits text into word tokens.
 *
 * Numerals, units and chemical formulas are dropped rather than counted. A
 * formula like "C22H28FN3O6S" is not a word, and it is not vowel-free either:
 * its oxygen "O" is a Turkish vowel, so a naive pass would score it as a
 * one-syllable word and make dense text look easier than it reads.
 */
export function tokenizeWords(text: string): string[] {
  return (
    text
      .replace(/<[^>]*>/g, " ")
      .split(/[\s\u00a0]+/)
      .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
      // A token mixing letters and digits is a formula or a dose code, not a word.
      // "C33H35FN2O5" would otherwise contribute a spurious syllable for its O.
      .filter((t) => t.length > 0 && !/\d/.test(t) && countSyllables(t) > 0)
  );
}

/** Splits text into sentences, discarding empty fragments. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/<[^>]*>/g, " ")
    .split(SENTENCE_BOUNDARY)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function bandFor(atesman: number): ReadabilityBand {
  if (atesman >= 90) return "çok kolay";
  if (atesman >= 70) return "kolay";
  if (atesman >= 50) return "orta";
  if (atesman >= 30) return "zor";
  return "çok zor";
}

const EMPTY: ReadabilityResult = {
  syllables: 0,
  words: 0,
  sentences: 0,
  syllablesPerWord: 0,
  wordsPerSentence: 0,
  atesman: 0,
  bezirciYilmaz: 0,
  band: "çok zor",
};

/**
 * Scores a Turkish passage.
 *
 * Empty or vowel-less input returns a zeroed result rather than throwing or
 * producing NaN, because the corpus contains fields that are legitimately just
 * a formula or a dosage code.
 */
export function scoreReadability(text: string): ReadabilityResult {
  const words = tokenizeWords(text);
  const sentenceTexts = splitSentences(text);

  if (words.length === 0) return { ...EMPTY };

  // A passage with no terminator is still one sentence.
  const sentences = Math.max(1, sentenceTexts.length);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const syllablesPerWord = syllables / words.length;
  const wordsPerSentence = words.length / sentences;

  // Ateşman (1997)
  const atesmanRaw = 198.825 - 40.175 * syllablesPerWord - 2.61 * wordsPerSentence;
  const atesman = Math.max(0, Math.min(100, atesmanRaw));

  // Bezirci-Yılmaz (2010): weighted counts of long words, averaged per sentence.
  let h3 = 0;
  let h4 = 0;
  let h5 = 0;
  let h6 = 0;
  for (const w of words) {
    const s = countSyllables(w);
    if (s === 3) h3++;
    else if (s === 4) h4++;
    else if (s === 5) h5++;
    else if (s >= 6) h6++;
  }
  const weighted =
    (h3 / sentences) * 0.84 +
    (h4 / sentences) * 1.5 +
    (h5 / sentences) * 3.5 +
    (h6 / sentences) * 26.25;
  const bezirciYilmaz = Math.sqrt(wordsPerSentence * weighted);

  return {
    syllables,
    words: words.length,
    sentences,
    syllablesPerWord: round2(syllablesPerWord),
    wordsPerSentence: round2(wordsPerSentence),
    atesman: round2(atesman),
    bezirciYilmaz: round2(bezirciYilmaz),
    band: bandFor(atesman),
  };
}

export interface CorpusReadability {
  count: number;
  medianAtesman: number;
  meanAtesman: number;
  medianGrade: number;
  bands: Record<ReadabilityBand, number>;
}

/** Aggregates scores across a corpus so the portfolio page can show a distribution. */
export function summarizeCorpus(texts: string[]): CorpusReadability {
  const scored = texts.map(scoreReadability).filter((r) => r.words > 0);
  const bands: Record<ReadabilityBand, number> = {
    "çok kolay": 0,
    kolay: 0,
    orta: 0,
    zor: 0,
    "çok zor": 0,
  };
  for (const r of scored) bands[r.band]++;

  if (scored.length === 0) {
    return { count: 0, medianAtesman: 0, meanAtesman: 0, medianGrade: 0, bands };
  }

  const atesmanValues = scored.map((r) => r.atesman).sort((a, b) => a - b);
  const gradeValues = scored.map((r) => r.bezirciYilmaz).sort((a, b) => a - b);

  return {
    count: scored.length,
    medianAtesman: round2(median(atesmanValues)),
    meanAtesman: round2(atesmanValues.reduce((a, b) => a + b, 0) / scored.length),
    medianGrade: round2(median(gradeValues)),
    bands,
  };
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
