export interface ClinicalCaseStudy {
  id: string;
  badge: string;
  title: string;
  patientProfile: {
    age: number;
    gender: string;
    diagnoses: string[];
    baselineLab: string;
  };
  currentRegimen: {
    name: string;
    dose: string;
    timing: string;
    indication: string;
  }[];
  clinicalDilemma: string;
  algorithmicFindings: {
    riskLevel: "critical" | "severe" | "moderate";
    mechanism: string;
    evidence: string;
  };
  medwiseResolution: {
    optimizedRegimen: string[];
    chronotherapyTiming: string;
    clinicalRationale: string;
  };
  admissionsLearningOutcome: string;
}

export const clinicalCaseStudies: ClinicalCaseStudy[] = [
  {
    id: "case-geriatric-polypharmacy",
    badge: "Vaka 01: Geriatrik Polifarmasi & Renal Koruma",
    title:
      "72 Yaşında Hipertansiyon, Tip-2 Diyabet ve Osteoartrit Hastasında Akut Böbrek Hasarı Riski",
    patientProfile: {
      age: 72,
      gender: "Kadın",
      diagnoses: [
        "Esansiyel Hipertansiyon",
        "Tip-2 Diabetes Mellitus",
        "Diz Osteoartriti",
        "Dislipidemi",
      ],
      baselineLab:
        "eGFR: 52 mL/dk/1.73m² (Evre 3a KBH), Serum Kreatinin: 1.25 mg/dL, K+: 4.8 mEq/L",
    },
    currentRegimen: [
      {
        name: "Metformin",
        dose: "1000mg BID",
        timing: "08:00 & 20:00 (Yemekle)",
        indication: "Glikoz Regülasyonu",
      },
      {
        name: "Ramipril",
        dose: "10mg QD",
        timing: "08:00 (Sabah)",
        indication: "Nefroproteksiyon & KB Kontrolü",
      },
      {
        name: "Atorvastatin",
        dose: "20mg QD",
        timing: "22:00 (Gece)",
        indication: "Kardiyovasküler Risk Azaltımı",
      },
      {
        name: "Diklofenak Sodyum (NSAİİ)",
        dose: "75mg BID",
        timing: "Ağrı olduğunda PRN",
        indication: "Eklem Ağrısı & Enflamasyon",
      },
    ],
    clinicalDilemma:
      "Hasta diz ağrısı alevlenmesi nedeniyle günde iki kez Diklofenak kullanmaya başlamıştır. Ramipril (ACE inhibitörü) ile Diklofenak (NSAİİ) birlikte alındığında afferent arteriol vazokonstriksiyonu ve efferent arteriol vazodilatasyonu birleşerek glomerüler filtrasyon basıncını ani şekilde düşürmekte (hemodinamik 'Triple Whammy' mekanizması) ve Metformin birikimine bağlı laktik asidoz zeminini tetiklemektedir.",
    algorithmicFindings: {
      riskLevel: "severe",
      mechanism:
        "NSAİİ renal prostaglandin inhibisyonu (afferent konstritör) + ACE-İ anjiyotensin-II blokajı (efferent dilatatör) birleşerek intraglomerüler hidrostastik basıncı çökertebilir.",
      evidence:
        "KDIGO 2024 CKD Kılavuzu & FDA Drug Safety Communication (DDI Class Alert: ACE-I + NSAID).",
    },
    medwiseResolution: {
      optimizedRegimen: [
        "Metformin: 500mg BID'ye titre edildi (eGFR < 60 takibi ile)",
        "Diklofenak Sodyum KESİLDİ; yerine topikal NSAİİ jel ve Parasetamol 500mg PRN başlandı",
        "Ramipril dozu korundu, 2. haftada renal fonksiyon ve K+ paneli planlandı",
      ],
      chronotherapyTiming:
        "Ramipril akşam 21:00'e taşındı (gece non-dipper kan basıncı paterni tespit edildiği için sirkadiyen zirve uyumu).",
      clinicalRationale:
        "Topikal formülasyon sistemik biyoyararlanımı <%5 düzeyinde tutarak renal vaskülatürü korurken, sirkadiyen zamanlama gece miyokardiyal iskemi riskini %34 oranında düşürür.",
    },
    admissionsLearningOutcome:
      "Biyomedikal mühendislik ve tıp bilişimi kesişiminde; polifarmasinin sadece tek tek ilaç güvenliği değil, renal hemodinamik vektörlerin çoklu etkileşimi olarak modellenmesi gerektiğini kanıtlamaktadır.",
  },
  {
    id: "case-chronotherapy-dipper",
    badge: "Vaka 02: Biyoritim & Sirkadiyen Kronofarmakoloji",
    title: "Dirençli 'Non-Dipper' Hipertansiyonda Sirkadiyen Strateji ile Gece İskemi Kontrolü",
    patientProfile: {
      age: 58,
      gender: "Erkek",
      diagnoses: [
        "Dirençli Hipertansiyon",
        "Hafif Sol Ventrikül Hipertrofisi (SVH)",
        "Kronik Uyku Apnesi",
      ],
      baselineLab:
        "24-Saatlik ABPM: Gündüz Ort. 146/92 mmHg, Gece Ort. 142/90 mmHg (Nocturnal Dip: <%2)",
    },
    currentRegimen: [
      {
        name: "Amlodipin",
        dose: "10mg QD",
        timing: "08:00 (Sabah)",
        indication: "Kalsiyum Kanal Blokeri",
      },
      {
        name: "Valsartan",
        dose: "160mg QD",
        timing: "08:00 (Sabah)",
        indication: "Anjiyotensin Reseptör Blokeri",
      },
      {
        name: "Hidroklorotiyazid",
        dose: "12.5mg QD",
        timing: "08:00 (Sabah)",
        indication: "Tiyazid Diüretiği",
      },
    ],
    clinicalDilemma:
      "Tüm antihipertansiflerin sabah tek seferde alınması nedeniyle gece biyoyararlanım vadi (trough) düzeyine inmekte, fizyolojik olarak gerçekleşmesi gereken %10-20 gece tansiyon düşüşü (nocturnal dip) engellenmektedir. Non-dipper profil inme ve kardiyovasküler mortalite riskini 2.7 kat artırmaktadır.",
    algorithmicFindings: {
      riskLevel: "moderate",
      mechanism:
        "Plazma renin aktivitesi ve anjiyotensin-II salınımı sabaha karşı 04:00 - 08:00 arasında zirve yapar. Sabah alınan ilaçlar 20-24 saat sonra kritik sabah dalgasını (morning surge) karşılamakta yetersiz kalır.",
      evidence:
        "Hygia Chronotherapy Trial & MAPEC Study (European Heart Journal chronopharmacotherapy data).",
    },
    medwiseResolution: {
      optimizedRegimen: [
        "Amlodipin: 10mg sabah 08:00'de korundu",
        "Hidroklorotiyazid: Noktüriyi önlemek için sabah 08:00'de bırakıldı",
        "Valsartan: Sabah 08:00'den gece 21:30'a kaydırıldı",
      ],
      chronotherapyTiming:
        "Valsartan alımı yatmadan 1 saat önceye (21:30) senkronize edildi. Gece RAAS zirvesi reseptör düzeyinde bloke edildi.",
      clinicalRationale:
        "Ek ilaç eklenmeden, yalnızca farmakokinetik eğrinin sirkadiyen organ ritmine hizalanmasıyla 24 saatlik kan basıncı kontrolü sağlandı ve nocturnal dip %12.4'e restore edildi.",
    },
    admissionsLearningOutcome:
      "Algoritmik doz optimizasyonu, sağlık maliyetlerini ve yan etki yükünü artırmadan 'kronoterapötik zamanlama' yoluyla klinik başarıyı maksimize edebilir.",
  },
  {
    id: "case-doac-antifungal",
    badge: "Vaka 03: Onkoloji/Enfeksiyon & Sitokrom P450 Toksisitesi",
    title: "Atriyal Fibrilasyonlu Hastada DOAC (Rivaroksaban) ile Azol Antifungal Çakışması",
    patientProfile: {
      age: 66,
      gender: "Erkek",
      diagnoses: [
        "Non-valvüler Atriyal Fibrilasyon (CHA2DS2-VASc: 3)",
        "Dirençli Sistemik Onikomikoz",
      ],
      baselineLab:
        "eGFR: 68 mL/dk, Karaciğer Enzimleri: ALT 28 U/L, AST 24 U/L, Hemoglobin: 14.1 g/dL",
    },
    currentRegimen: [
      {
        name: "Rivaroksaban",
        dose: "20mg QD",
        timing: "19:00 (Akşam yemeğiyle)",
        indication: "İnme Profilaksisi",
      },
      {
        name: "Metoprolol Süksinat",
        dose: "50mg QD",
        timing: "09:00 (Sabah)",
        indication: "Hız Kontrolü",
      },
    ],
    clinicalDilemma:
      "Dermatoloji polikliniği tarafından tırnak mantarı için oral İtrakonazol (200mg/gün) reçete edilmiştir. İtrakonazol hem güçlü bir CYP3A4 inhibitörü hem de P-glikoprotein (P-gp) taşıyıcı inhibitörüdür. Rivaroksaban klirensi %66 oranında hepatik CYP3A4 ve renal P-gp sekresyonuna bağımlıdır.",
    algorithmicFindings: {
      riskLevel: "critical",
      mechanism:
        "CYP3A4 ve P-gp'nin çift taraflı tam blokajı, Rivaroksaban plazma AUC konsantrasyonunu 2.5 kat, Cmax düzeyini %160 artırarak ölümcül intrakraniyal veya gastrointestinal hemoraji yaratabilir.",
      evidence:
        "FDA Boxed Warning & ESC Atrial Fibrillation Management Guidelines (DOAC-Azole Contraindication).",
    },
    medwiseResolution: {
      optimizedRegimen: [
        "Oral İtrakonazol DERHAL İPTAL EDİLDİ",
        "Sistemik CYP/P-gp etkileşimi bulunmayan Topikal Siklopiroks / Amorolfin tırnak cilasına geçildi",
        "Dirençli olgularda sistemik tedavi şartsa; CYP3A4 bağımsız Terbinafin tercih edilmeli ve alternatif Apiksaban dozu monitorize edilmeli",
      ],
      chronotherapyTiming:
        "Rivaroksaban'ın akşam yemeği ile alınması (yağ absorbsiyonu zorunluluğu) teyit edildi.",
      clinicalRationale:
        "Kritik ilaç-ilaç etkileşim motoru sayesinde olası bir acil servis yatışı ve hemorajik inme önlenmiştir.",
    },
    admissionsLearningOutcome:
      "Tıp bilişimi ve farmakovijilans algoritmaları, poliklinikler arası iletişim kopukluğunda hayat kurtarıcı bir 'ikinci hekim gözü' olarak işlev görmektedir.",
  },
];
