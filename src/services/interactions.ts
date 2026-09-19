import type { Drug } from "../types/index.ts";
import { normalizeClinicalText } from "../utils/clinical.ts";

export interface DrugInteractionResult {
  drugA: string;
  drugB: string;
  severity: "critical" | "severe" | "moderate" | "mild";
  category:
    | "CYP450"
    | "Kanama Riski"
    | "Serotonin Sendromu"
    | "Hiperkalemi"
    | "QTc Uzaması"
    | "Renal/Emilim";
  title: string;
  mechanism: string;
  clinicalAction: string;
}

export interface InteractionAnalysis {
  drugsAnalyzed: Drug[];
  totalInteractions: number;
  maxSeverity: "critical" | "severe" | "moderate" | "mild" | "none";
  interactions: DrugInteractionResult[];
  summaryMessage: string;
}

// Check interactions among a list of drugs
export function checkDrugInteractions(drugs: Drug[]): InteractionAnalysis {
  if (!drugs || drugs.length < 2) {
    return {
      drugsAnalyzed: drugs || [],
      totalInteractions: 0,
      maxSeverity: "none",
      interactions: [],
      summaryMessage: "Etkileşim analizi için en az 2 ilaç seçiniz.",
    };
  }

  const results: DrugInteractionResult[] = [];

  // Pairwise evaluation
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const drugA = drugs[i];
      const drugB = drugs[j];
      const pairResults = evaluatePair(drugA, drugB);
      results.push(...pairResults);
    }
  }

  // Determine maximum severity
  let maxSeverity: InteractionAnalysis["maxSeverity"] = "none";
  if (results.some((r) => r.severity === "critical")) {
    maxSeverity = "critical";
  } else if (results.some((r) => r.severity === "severe")) {
    maxSeverity = "severe";
  } else if (results.some((r) => r.severity === "moderate")) {
    maxSeverity = "moderate";
  } else if (results.length > 0) {
    maxSeverity = "mild";
  }

  const summaryMessage =
    results.length === 0
      ? "Seçilen ilaçlar arasında bilinen majör veya kritik bir farmakokinetik etkileşim tespit edilmedi."
      : `Seçilen ${drugs.length} ilaç arasında ${results.length} adet potansiyel etkileşim tespit edildi.`;

  return {
    drugsAnalyzed: drugs,
    totalInteractions: results.length,
    maxSeverity,
    interactions: results,
    summaryMessage,
  };
}

function evaluatePair(a: Drug, b: Drug): DrugInteractionResult[] {
  const list: DrugInteractionResult[] = [];

  const textA = normalizeClinicalText(
    `${a.name} ${a.genericNameTR} ${a.genericNameUS} ${a.pharmacokinetics.metabolismPathway} ${a.interactions.map((x) => x.title + " " + x.description).join(" ")}`
  );
  const textB = normalizeClinicalText(
    `${b.name} ${b.genericNameTR} ${b.genericNameUS} ${b.pharmacokinetics.metabolismPathway} ${b.interactions.map((x) => x.title + " " + x.description).join(" ")}`
  );

  const atcA = a.atc || "";
  const atcB = b.atc || "";

  // 1. Anticoagulant / Antiplatelet + NSAID (Bleeding Risk)
  const isBleedingRiskA =
    atcA.startsWith("B01") ||
    textA.includes("antikoagulan") ||
    textA.includes("varfarin") ||
    textA.includes("rivaroksaban") ||
    textA.includes("klopidogrel");
  const isNsaidB =
    atcB.startsWith("M01A") ||
    textB.includes("nsaii") ||
    textB.includes("ibuprofen") ||
    textB.includes("diklofenak") ||
    textB.includes("naproksen");

  const isBleedingRiskB =
    atcB.startsWith("B01") ||
    textB.includes("antikoagulan") ||
    textB.includes("varfarin") ||
    textB.includes("rivaroksaban") ||
    textB.includes("klopidogrel");
  const isNsaidA =
    atcA.startsWith("M01A") ||
    textA.includes("nsaii") ||
    textA.includes("ibuprofen") ||
    textA.includes("diklofenak") ||
    textA.includes("naproksen");

  if ((isBleedingRiskA && isNsaidB) || (isBleedingRiskB && isNsaidA)) {
    list.push({
      drugA: a.name.split("&")[0].trim(),
      drugB: b.name.split("&")[0].trim(),
      severity: "severe",
      category: "Kanama Riski",
      title: "Gastrointestinal Kanama ve Trombosit Fonksiyon Bozukluğu",
      mechanism:
        "NSAİİ COX-1 inhibisyonu ile gastrik mukozal koruyucu prostaglandinleri azaltırken, antitrombotik ajan primer hemostazı baskılar. Majör GI kanama riski katlanarak artar.",
      clinicalAction:
        "Kombinasyondan kaçınınız veya zorunluysa proton pompa inhibitörü (PPI) gastrik profilaksisi ekleyip trombosit/INR değerlerini yakından takip ediniz.",
    });
  }

  // 2. Statin + Strong CYP3A4 Inhibitor (Rhabdomyolysis Risk)
  const isStatinA =
    atcA.startsWith("C10AA") ||
    textA.includes("statin") ||
    textA.includes("atorvastatin") ||
    textA.includes("simvastatin");
  const isCyp3a4InhB =
    textB.includes("klaritromisin") ||
    textB.includes("itrakonazol") ||
    textB.includes("flukonazol") ||
    textB.includes("ketokonazol") ||
    textB.includes("diltiazem");

  const isStatinB =
    atcB.startsWith("C10AA") ||
    textB.includes("statin") ||
    textB.includes("atorvastatin") ||
    textB.includes("simvastatin");
  const isCyp3a4InhA =
    textA.includes("klaritromisin") ||
    textA.includes("itrakonazol") ||
    textA.includes("flukonazol") ||
    textA.includes("ketokonazol") ||
    textA.includes("diltiazem");

  if ((isStatinA && isCyp3a4InhB) || (isStatinB && isCyp3a4InhA)) {
    list.push({
      drugA: a.name.split("&")[0].trim(),
      drugB: b.name.split("&")[0].trim(),
      severity: "critical",
      category: "CYP450",
      title: "Hepatik CYP3A4 İnhibisyonu & Rabdomiyoliz Tehlikesi",
      mechanism:
        "Güçlü CYP3A4 inhibitörü statinin hepatik ilk geçiş klirensini bloke ederek plazma EAA (AUC) eğrisini 4 ila 10 kat artırır; akut miyopati ve rabdomiyoliz riski oluşturur.",
      clinicalAction:
        "Eşzamanlı kullanım kontrendikedir. Antibakteriyel/antifungal kür süresince statin tedavisine geçici ara veriniz veya CYP3A4 bağımsız Rosuvastatin/Pravastatin'e geçiniz.",
    });
  }

  // 3. ACE Inhibitor / ARB + Potassium-Sparing Diuretic (Hyperkalemia)
  const isRaasA =
    atcA.startsWith("C09") ||
    textA.includes("ramipril") ||
    textA.includes("losartan") ||
    textA.includes("enalapril") ||
    textA.includes("valsartan");
  const isKSparedB =
    textB.includes("spironolakton") || textB.includes("eplerenon") || textB.includes("potasyum");

  const isRaasB =
    atcB.startsWith("C09") ||
    textB.includes("ramipril") ||
    textB.includes("losartan") ||
    textB.includes("enalapril") ||
    textB.includes("valsartan");
  const isKSparedA =
    textA.includes("spironolakton") || textA.includes("eplerenon") || textA.includes("potasyum");

  if ((isRaasA && isKSparedB) || (isRaasB && isKSparedA)) {
    list.push({
      drugA: a.name.split("&")[0].trim(),
      drugB: b.name.split("&")[0].trim(),
      severity: "severe",
      category: "Hiperkalemi",
      title: "Aditif Aldosteron Blokajı ve Hayati Hiperkalemi",
      mechanism:
        "RAAS blokajı ve kortikal toplayıcı tübüllerde aldosteron reseptör antagonizmi birleşerek renal potasyum atılımını kritik derecede düşürür.",
      clinicalAction:
        "Serum potasyumu ve kreatinini (eGFR) bazal düzeyde ve tedavinin 1. ve 4. haftasında mutlaka ölçünüz. K > 5.5 mEq/L durumunda doz azaltınız.",
    });
  }

  // 4. Clopidogrel + Omeprazole / Esomeprazole (CYP2C19 Bioactivation Impairment)
  const isClopiA = textA.includes("klopidogrel") || textA.includes("plavix");
  const isCyp2c19PpiB = textB.includes("omeprazol") || textB.includes("esomeprazol");
  const isClopiB = textB.includes("klopidogrel") || textB.includes("plavix");
  const isCyp2c19PpiA = textA.includes("omeprazol") || textA.includes("esomeprazol");

  if ((isClopiA && isCyp2c19PpiB) || (isClopiB && isCyp2c19PpiA)) {
    list.push({
      drugA: a.name.split("&")[0].trim(),
      drugB: b.name.split("&")[0].trim(),
      severity: "moderate",
      category: "CYP450",
      title: "CYP2C19 Yarışmalı İnhibisyonu ve Antitrombotik Direnç",
      mechanism:
        "Klopidogrel bir ön ilaçtır (prodrug); aktif metabolitine dönüşmek için hepatik CYP2C19 enzimine muhtaçtır. Omeprazol bu enzimi inhibe ederek antitrombosit etkiyi zayıflatır.",
      clinicalAction:
        "Klopidogrel kullanan hastalarda CYP2C19'a afinitesi çok daha düşük olan Pantoprazol veya H2 reseptör blokeri (Famotidin) tercih ediniz.",
    });
  }

  // 5. Serotonin Syndrome: SSRI/SNRI + Triptan / Tramadol
  const isSerotoninA =
    atcA.startsWith("N06A") ||
    textA.includes("ssri") ||
    textA.includes("sertralin") ||
    textA.includes("essitalopram") ||
    textA.includes("fluoksetin");
  const isSerotoninB2 =
    textB.includes("sumatriptan") || textB.includes("zolmitriptan") || textB.includes("tramadol");
  const isSerotoninB =
    atcB.startsWith("N06A") ||
    textB.includes("ssri") ||
    textB.includes("sertralin") ||
    textB.includes("essitalopram") ||
    textB.includes("fluoksetin");
  const isSerotoninA2 =
    textA.includes("sumatriptan") || textA.includes("zolmitriptan") || textA.includes("tramadol");

  if ((isSerotoninA && isSerotoninB2) || (isSerotoninB && isSerotoninA2)) {
    list.push({
      drugA: a.name.split("&")[0].trim(),
      drugB: b.name.split("&")[0].trim(),
      severity: "severe",
      category: "Serotonin Sendromu",
      title: "Santral Serotonerjik Hiperaktivite ve Toksisite Riski",
      mechanism:
        "Sinaptik aralıkta serotonin gerialımının engellenmesi ile 5-HT1B/1D reseptör agonist stimülasyonunun sinerjik kombinasyonu otonomik instabilite ve tremor yaratabilir.",
      clinicalAction:
        "Hastayı taşikardi, ajitasyon, terleme ve klonus semptomları yönünden bilgilendiriniz. Minimum etkili dozda başlayınız.",
    });
  }

  // 6. Generic CYP Pathway overlap fallback
  if (
    list.length === 0 &&
    a.pharmacokinetics.metabolismPathway &&
    b.pharmacokinetics.metabolismPathway
  ) {
    const cypA = a.pharmacokinetics.metabolismPathway;
    const cypB = b.pharmacokinetics.metabolismPathway;
    if (cypA.includes("3A4") && cypB.includes("3A4")) {
      list.push({
        drugA: a.name.split("&")[0].trim(),
        drugB: b.name.split("&")[0].trim(),
        severity: "mild",
        category: "CYP450",
        title: "Hepatik CYP3A4 Substrat Rekabeti",
        mechanism:
          "Her iki bileşik de hepatik Sitokrom P450 3A4 yolağı üzerinden metabolize olmaktadır. Hafif derecede klerens azalması ve plazma düzeyinde dalgalanma görülebilir.",
        clinicalAction:
          "Rutin klinik izlem yeterlidir; belirgin toksisite veya etkinlik kaybı görülmedikçe doz modifikasyonu gerekmez.",
      });
    }
  }

  return list;
}
