/**
 * Plain-Turkish summaries for the drug corpus.
 *
 * The problem this solves: the corpus `description` field is written in
 * postgraduate pharmacology Turkish. Measured with `src/utils/readability.ts`,
 * the 593 descriptions score a median Ateşman of 1.65 out of 100 and 557 of them
 * land in the "çok zor" band. MedWise is for people who struggle to understand
 * their medication, so that text cannot be the primary thing they read.
 *
 * The fix is layering, not dumbing down. Each monograph leads with a plain
 * summary from this module; the original mechanism text stays underneath behind
 * a "Neden?" disclosure. Nothing is deleted.
 *
 * Honesty constraint: a summary is derived from the drug's WHO ATC therapeutic
 * class, so it is only produced when that class is real. For the 537 records
 * whose ATC code was synthesised by the data generator, `buildPlainSummary`
 * returns null and the UI says no summary has been written yet. Guessing a
 * drug's purpose from an invented code would be worse than saying nothing.
 */

import type { Drug } from "../types/index.ts";
import { isVerifiedAtc } from "./provenance.ts";

export interface PlainSummary {
  /** Two short sentences: what the drug is for, in second person. */
  purpose: string;
  /** One short sentence on how it is usually taken. */
  howToTake: string;
  /** The ATC group key this text was derived from, for auditability. */
  derivedFrom: string;
}

interface ClassEntry {
  purpose: string;
  howToTake: string;
}

/**
 * Plain-language lexicon keyed by WHO ATC group.
 *
 * Keys are matched longest-first (5 chars, then 4, then 3), so a specific
 * subgroup can override a broader one. Text is deliberately second person,
 * present tense and short-sentenced: sentence length is the single biggest
 * lever on the Ateşman score, ahead of word choice.
 */
const ATC_LEXICON: Record<string, ClassEntry> = {
  // --- A: sindirim sistemi ve metabolizma ---
  A02BA: {
    purpose: "Bu ilaç midenizdeki asidi azaltır. Mide yanmasını ve ekşimeyi giderir.",
    howToTake: "Genellikle akşam veya yatmadan önce alınır.",
  },
  A02BC: {
    purpose:
      "Bu ilaç midenizin ürettiği asidi güçlü biçimde azaltır. Mide yanmasını ve ülseri iyileştirir.",
    howToTake: "Sabah aç karnına, kahvaltıdan yarım saat önce alınır.",
  },
  A03FA: {
    purpose: "Bu ilaç midenizin daha hızlı boşalmasını sağlar. Bulantıyı ve kusmayı keser.",
    howToTake: "Yemeklerden yarım saat önce alınır.",
  },
  A04AA: {
    purpose: "Bu ilaç bulantı ve kusmayı önler. Sıklıkla kemoterapi veya ameliyat sonrası verilir.",
    howToTake: "Bulantı başlamadan önce alınması en etkilidir.",
  },
  A10BA: {
    purpose: "Bu ilaç kan şekerinizi düşürür. Tip 2 şeker hastalığında ilk seçilen ilaçtır.",
    howToTake: "Mideyi rahatsız etmemesi için yemekle birlikte alınır.",
  },

  // --- B: kan ve kan yapıcı organlar ---
  B01AA: {
    purpose: "Bu ilaç kanı sulandırır. Damarda pıhtı oluşmasını önler.",
    howToTake: "Her gün aynı saatte alınır ve kan testiyle düzenli takip gerekir.",
  },
  B01AC: {
    purpose:
      "Bu ilaç kan pulcuklarının birbirine yapışmasını engeller. Kalp krizi ve felç riskini azaltır.",
    howToTake: "Mideyi korumak için genellikle tok karnına alınır.",
  },
  B01AF: {
    purpose:
      "Bu ilaç kanınızın pıhtılaşmasını azaltır. Bacak ve akciğer damarında pıhtı oluşmasını önler.",
    howToTake: "Her gün aynı saatte, doktorun söylediği dozda alınır.",
  },

  // --- C: kalp ve damar sistemi ---
  C03CA: {
    purpose: "Bu ilaç vücudunuzdaki fazla suyu idrarla atar. Şişliği ve nefes darlığını azaltır.",
    howToTake: "Sabah alınır, çünkü idrara çıkmayı artırır.",
  },
  C03DA: {
    purpose: "Bu ilaç fazla suyu atarken potasyumunuzu korur. Kalp yetmezliğinde sık kullanılır.",
    howToTake: "Sabah alınır. Potasyum düzeyiniz düzenli ölçülmelidir.",
  },
  C07AB: {
    purpose: "Bu ilaç kalbinizi yavaşlatır ve dinlendirir. Tansiyonunuzu düşürür.",
    howToTake: "Her gün aynı saatte alınır. Aniden bırakılmamalıdır.",
  },
  C07AG: {
    purpose:
      "Bu ilaç hem kalbinizi yavaşlatır hem damarlarınızı gevşetir. Tansiyonu ve kalp yükünü azaltır.",
    howToTake: "Yemekle birlikte alınır. Aniden bırakılmamalıdır.",
  },
  C08CA: {
    purpose: "Bu ilaç damarlarınızı gevşetir. Böylece tansiyonunuz düşer.",
    howToTake: "Günde bir kez, her gün aynı saatte alınır.",
  },
  C08DA: {
    purpose: "Bu ilaç kalp atışınızı düzenler ve damarlarınızı gevşetir. Tansiyonu düşürür.",
    howToTake: "Doktorun belirlediği saatte düzenli alınır.",
  },
  C08DB: {
    purpose: "Bu ilaç damarlarınızı gevşetir ve kalbinizin yükünü azaltır. Göğüs ağrısını önler.",
    howToTake: "Her gün aynı saatte alınır.",
  },
  C09AA: {
    purpose: "Bu ilaç damarları genişletir. Tansiyonu düşürür, böbreği korur.",
    howToTake: "Günde bir kez alınır. Kuru öksürük yaparsa doktorunuza söyleyin.",
  },
  C09CA: {
    purpose: "Bu ilaç damarları gevşetir. Tansiyonu düşürür, böbreği korur.",
    howToTake: "Günde bir kez, her gün aynı saatte alınır.",
  },
  C10AA: {
    purpose: "Bu ilaç kanınızdaki kötü kolesterolü düşürür. Kalp krizi ve felç riskinizi azaltır.",
    howToTake: "Akşam alınır. Kas ağrısı olursa doktorunuza bildirin.",
  },
  C10AB: {
    purpose: "Bu ilaç kandaki yağı düşürür. Kolesterol dengesini düzeltir.",
    howToTake: "Yemekle birlikte alınır.",
  },
  C10BA: {
    purpose:
      "Bu ilaç kolesterolü iki ayrı yoldan düşürür. Hem karaciğerde yapımını hem bağırsakta emilimini azaltır.",
    howToTake: "Akşam alınır. Kas ağrısı olursa doktorunuza bildirin.",
  },

  // --- H: hormon ilaçları ---
  H03AA: {
    purpose: "Bu ilaç eksik tiroit hormonunuzu yerine koyar. Yorgunluğu ve üşümeyi geçirir.",
    howToTake: "Sabah aç karnına, bir bardak suyla alınır. Yarım saat bir şey yemeyin.",
  },

  // --- J: enfeksiyon ilaçları ---
  J01AA: {
    purpose: "Bu bir antibiyotiktir. Mikrobun üremesini durdurur.",
    howToTake: "Bol suyla ve dik otururken alınır. Güneşte cildiniz hassaslaşabilir.",
  },
  J01CR: {
    purpose: "Bu bir antibiyotiktir. Bakteri kaynaklı enfeksiyonu tedavi eder.",
    howToTake: "Yemek başında alınır. Kutuyu sonuna kadar bitirin.",
  },
  J01DD: {
    purpose: "Bu güçlü bir antibiyotiktir. Ağır mikrop hastalığında kullanılır.",
    howToTake: "Genellikle hastanede iğne veya serum olarak verilir.",
  },
  J01FA: {
    purpose: "Bu bir antibiyotiktir. Solunum yolu ve cilt enfeksiyonlarında kullanılır.",
    howToTake: "Doktorun verdiği gün sayısı kadar aksatmadan alınır.",
  },
  J01MA: {
    purpose: "Bu bir antibiyotiktir. İdrar yolu ve bağırsak enfeksiyonlarında kullanılır.",
    howToTake: "Bol suyla alınır. Süt ve antasitle birlikte alınmaz.",
  },
  J01XD: {
    purpose:
      "Bu ilaç bazı mikropları ve parazitleri öldürür. Bağırsak ve diş eti enfeksiyonlarında kullanılır.",
    howToTake: "Yemekle alınır. Tedavi boyunca alkol almayın.",
  },

  // --- M: kas ve iskelet sistemi ---
  M01AB: {
    purpose: "Bu ilaç ağrıyı ve şişliği azaltır. Romatizma ve kas ağrısında kullanılır.",
    howToTake: "Tok karnına alınır. Uzun süre kullanmayın.",
  },
  M01AC: {
    purpose: "Bu ilaç eklem ağrısını ve şişliği azaltır. Günde bir kez kullanılır.",
    howToTake: "Tok karnına, günde bir kez alınır.",
  },
  M01AE: {
    purpose: "Bu ilaç ağrıyı, şişliği ve ateşi azaltır. Kas ve eklem ağrısında kullanılır.",
    howToTake: "Tok karnına alınır. Mideniz hassassa doktorunuza söyleyin.",
  },
  M04AA: {
    purpose: "Bu ilaç kanınızdaki ürik asidi düşürür. Gut krizlerini önler.",
    howToTake: "Yemekten sonra ve bol suyla alınır.",
  },
  M04AC: {
    purpose: "Bu ilaç gut krizindeki şiddetli eklem ağrısını keser.",
    howToTake: "Kriz başlar başlamaz alınır. İshal yaparsa doktorunuza danışın.",
  },

  // --- N: sinir sistemi ---
  N02BE: {
    purpose: "Bu ilaç ağrınızı dindirir ve ateşinizi düşürür.",
    howToTake: "Günde belirtilen dozu aşmayın. Karaciğeriniz için bu önemlidir.",
  },
  N02BF: {
    purpose: "Bu ilaç sinir kaynaklı yanıcı ağrıyı azaltır. Yaygın kaygıda da kullanılır.",
    howToTake: "Doz yavaş yavaş artırılır. Aniden bırakılmamalıdır.",
  },
  N05AH: {
    purpose: "Bu ilaç düşünce ve ruh halinizi dengeler. Uykuya dalmayı da kolaylaştırır.",
    howToTake: "Genellikle akşam alınır. Aniden bırakılmamalıdır.",
  },
  N06AB: {
    purpose:
      "Bu ilaç beyindeki serotonin dengesini düzeltir. Depresyon ve kaygı belirtilerini azaltır.",
    howToTake: "Etkisi iki üç haftada başlar. Kendi kendinize bırakmayın.",
  },
  N06AX: {
    purpose:
      "Bu ilaç ruh halinizi düzenler. Depresyon, kaygı ve bazı sinir ağrılarında kullanılır.",
    howToTake: "Her gün aynı saatte alınır. Aniden bırakılmamalıdır.",
  },

  // --- R: solunum sistemi ---
  R03DC: {
    purpose: "Bu ilaç astım ve alerji kaynaklı hava yolu daralmasını önler.",
    howToTake: "Akşam alınır. Kriz anında değil, düzenli korunma için kullanılır.",
  },
  R06AE: {
    purpose:
      "Bu ilaç alerji belirtilerini azaltır. Hapşırığı, kaşıntıyı ve burun akıntısını keser.",
    howToTake: "Günde bir kez alınır. Hafif uyku yapabilir.",
  },
  R06AX: {
    purpose: "Bu ilaç alerji belirtilerini azaltır. Genellikle uyku yapmaz.",
    howToTake: "Günde bir kez, her gün aynı saatte alınır.",
  },
};

/**
 * Looks up the lexicon by progressively shorter ATC prefixes.
 * Returns the matched key alongside the entry so the UI can show what the
 * summary was derived from.
 */
function lookupClass(atc: string): { key: string; entry: ClassEntry } | null {
  for (const length of [5, 4, 3]) {
    const key = atc.slice(0, length);
    const entry = ATC_LEXICON[key];
    if (entry) return { key, entry };
  }
  return null;
}

/**
 * Builds the patient-facing summary for a drug.
 *
 * Returns null when the ATC code is not a real WHO code, or when the class has
 * no lexicon entry yet. Callers must render an explicit "not written yet" state
 * rather than falling back to the technical description.
 */
export function buildPlainSummary(drug: Drug): PlainSummary | null {
  if (!isVerifiedAtc(drug.atc)) return null;

  const match = lookupClass(drug.atc.trim());
  if (!match) return null;

  return {
    purpose: match.entry.purpose,
    howToTake: match.entry.howToTake,
    derivedFrom: match.key,
  };
}

/** Every ATC group the lexicon covers. Used by tests and the portfolio page. */
export function coveredAtcGroups(): string[] {
  return Object.keys(ATC_LEXICON).sort();
}
