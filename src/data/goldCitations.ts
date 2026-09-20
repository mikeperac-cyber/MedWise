/**
 * Hand-verified citations for the 56 drugs whose ATC codes are both
 * structurally valid and confirmed against a real registry document.
 * Every URL here was fetched and confirmed, not guessed — see the research
 * notes in the commit/PR that added this file. `labelSource` is omitted
 * where no specific, stable document URL could be confirmed.
 *
 * ATC codes were verified by fetching each code's page on the WHO
 * Collaborating Centre ATC/DDD Index (whocc.no redirects to
 * atcddd.fhi.no/atc_ddd_index/?code=<CODE>) and confirming the substance
 * name shown matches. Label sources, where present, are specific DailyMed
 * SPL/drug-info pages (setid-addressed), found via targeted web search and
 * not guessed.
 */

export interface CitationSource {
  url: string;
  label: string;
}

export interface GoldCitation {
  atcSource: CitationSource;
  labelSource?: CitationSource & { registry: string };
  verifiedOn: string;
}

export const GOLD_CITATIONS: Record<string, GoldCitation> = {
  atorvastatin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C10BA05",
      label: "WHO ATC/DDD Index — C10BA05 (atorvastatin and ezetimibe)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6375eae7-e159-4fb2-a91c-9aa20ac3c9e1",
      label: "LYPQOZET (ezetimibe and atorvastatin) tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  metformin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A10BA02",
      label: "WHO ATC/DDD Index — A10BA02 (metformin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f1530d4f-21d9-4a4f-a814-07b180828ecd",
      label: "Metformin Hydrochloride Extended-Release Tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  amoxicillin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=J01CR02",
      label: "WHO ATC/DDD Index — J01CR02 (amoxicillin and beta-lactamase inhibitor)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=22b16383-9ce3-45e7-80c3-db332f59abbf",
      label: "Amoxicillin and Clavulanate Potassium Tablets, USP — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  ibuprofen: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=M01AE01",
      label: "WHO ATC/DDD Index — M01AE01 (ibuprofen)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ba86e936-ef72-43e5-aebf-f2c788fe2266",
      label: "Ibuprofen tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  paracetamol: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N02BE01",
      label: "WHO ATC/DDD Index — N02BE01 (paracetamol)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2651bf11-4d66-43ba-e054-00144ff88e88",
      label: "Acetaminophen 500 mg tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  omeprazole: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A02BC01",
      label: "WHO ATC/DDD Index — A02BC01 (omeprazole)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=19097902-a5e6-423a-8569-31c569cd3cdb",
      label: "Omeprazole Delayed-Release Capsules — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  sertraline: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N06AB06",
      label: "WHO ATC/DDD Index — N06AB06 (sertraline)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4e09f580-d612-416c-a4a4-79a4411845b2",
      label: "Sertraline Hydrochloride Tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  levothyroxine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=H03AA01",
      label: "WHO ATC/DDD Index — H03AA01 (levothyroxine sodium)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fca88c97-5cd4-4834-ba87-deb5bd637788",
      label: "Levothyroxine Sodium Tablets, USP — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  aspirin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=B01AC06",
      label: "WHO ATC/DDD Index — B01AC06 (acetylsalicylic acid)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f572d9fe-035b-4c23-93a2-c7672261066e",
      label: "Aspirin Low Dose tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  amlodipine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C08CA01",
      label: "WHO ATC/DDD Index — C08CA01 (amlodipine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=180ee374-24f2-4b9c-9d54-8815f2b1dc9b",
      label: "Amlodipine Besylate Tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  rosuvastatin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C10AA07",
      label: "WHO ATC/DDD Index — C10AA07 (rosuvastatin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=72ab1549-5a5a-4dc3-8230-1f77de59b947",
      label: "Rosuvastatin Calcium Tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  simvastatin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C10AA01",
      label: "WHO ATC/DDD Index — C10AA01 (simvastatin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5c1c694c-4b08-469e-b538-08e69df06146",
      label: "Simvastatin Tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  pravastatin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C10AA03",
      label: "WHO ATC/DDD Index — C10AA03 (pravastatin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=99e0e848-f8f3-4b42-b880-8fbc42633948",
      label: "Pravastatin Sodium Tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  fenofibrate: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C10AB05",
      label: "WHO ATC/DDD Index — C10AB05 (fenofibrate)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=829f5c2e-3329-4644-bccb-267afb678540",
      label: "Fenofibrate Capsules — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  pantoprazole: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A02BC02",
      label: "WHO ATC/DDD Index — A02BC02 (pantoprazole)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1e4edc4d-fa80-4afc-9864-59009764601f",
      label: "Pantoprazole Sodium Delayed-Release Tablets — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  esomeprazole: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A02BC05",
      label: "WHO ATC/DDD Index — A02BC05 (esomeprazole)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c45fd180-9d81-41e0-b7f8-025b8f29763a",
      label: "Esomeprazole Magnesium Delayed-Release Capsules — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  lansoprazole: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A02BC03",
      label: "WHO ATC/DDD Index — A02BC03 (lansoprazole)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9e246e79-2737-4cbb-ad5d-4e76893da3be",
      label: "Lansoprazole Delayed-Release Capsules — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  famotidine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A02BA03",
      label: "WHO ATC/DDD Index — A02BA03 (famotidine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f149ecc1-d66c-42f9-a3f4-2ab6a522942b",
      label: "Famotidine Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  ondansetron: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A04AA01",
      label: "WHO ATC/DDD Index — A04AA01 (ondansetron)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=88b7432b-f5a7-40f3-9b0c-e7b125f5103c",
      label: "Ondansetron Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  metoclopramide: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=A03FA01",
      label: "WHO ATC/DDD Index — A03FA01 (metoclopramide)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f32d6e27-5b7b-4b17-af2e-0250447ee560",
      label: "Metoclopramide Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  clopidogrel: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=B01AC04",
      label: "WHO ATC/DDD Index — B01AC04 (clopidogrel)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4dbcad6e-90d5-4f38-9b69-72bbcac38fcc",
      label: "Clopidogrel Bisulfate Tablet, film coated — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  rivaroxaban: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=B01AF01",
      label: "WHO ATC/DDD Index — B01AF01 (rivaroxaban)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=122e6f78-067b-9065-adb2-ec7fec9f008e",
      label: "Rivaroxaban Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  apixaban: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=B01AF02",
      label: "WHO ATC/DDD Index — B01AF02 (apixaban)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=095a08ac-cf0e-497e-a682-ddef38d6b29c",
      label: "Apixaban Tablet, film coated — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  warfarin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=B01AA03",
      label: "WHO ATC/DDD Index — B01AA03 (warfarin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=36a919ce-7a21-40c0-9af5-2299bf2b1f97",
      label: "Warfarin Sodium Tablets, USP — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  ramipril: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C09AA05",
      label: "WHO ATC/DDD Index — C09AA05 (ramipril)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d6d57158-e8f9-4c91-8317-0374e0c87d33",
      label: "Ramipril Capsule — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  losartan: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C09CA01",
      label: "WHO ATC/DDD Index — C09CA01 (losartan)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e5886220-43b7-46e1-9034-5242ba245bd1",
      label: "Losartan Potassium Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  valsartan: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C09CA03",
      label: "WHO ATC/DDD Index — C09CA03 (valsartan)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f4a5df78-157b-4996-845c-235234250f11",
      label: "Valsartan Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  candesartan: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C09CA06",
      label: "WHO ATC/DDD Index — C09CA06 (candesartan)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d23fe59a-2ad6-4885-a0d8-2239048f05a3",
      label: "Candesartan Cilexetil Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  metoprolol: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C07AB02",
      label: "WHO ATC/DDD Index — C07AB02 (metoprolol)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=498e064d-ece3-4885-a06f-1c9d7b83a8aa",
      label: "Metoprolol Succinate Tablet, extended release — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  bisoprolol: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C07AB07",
      label: "WHO ATC/DDD Index — C07AB07 (bisoprolol)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d82243b9-3e56-4a2b-8750-cb95ec106885",
      label: "Bisoprolol Fumarate Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  nebivolol: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C07AB12",
      label: "WHO ATC/DDD Index — C07AB12 (nebivolol)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6e43a4e2-574e-4f4a-804d-e346b4edd2f1",
      label: "Nebivolol Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  carvedilol: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C07AG02",
      label: "WHO ATC/DDD Index — C07AG02 (carvedilol)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7a7d3ca1-05b0-4c7e-aefa-492cc441585d",
      label: "Carvedilol Tablet, film coated — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  diltiazem: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C08DB01",
      label: "WHO ATC/DDD Index — C08DB01 (diltiazem)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c7c6a74e-5f73-4265-a0e0-8fd2cd26909e",
      label: "Diltiazem Hydrochloride Extended Release Capsule — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  verapamil: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C08DA01",
      label: "WHO ATC/DDD Index — C08DA01 (verapamil)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=343724eb-e80b-4729-80e7-6b8028713ea1",
      label: "Verapamil Hydrochloride Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  furosemide: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C03CA01",
      label: "WHO ATC/DDD Index — C03CA01 (furosemide)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=46675cd8-ad7e-40ae-e054-00144ff8d46c",
      label: "Furosemide Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  spironolactone: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=C03DA01",
      label: "WHO ATC/DDD Index — C03DA01 (spironolactone)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4542d698-0299-4b6f-91a7-c8127384ca0c",
      label: "Spironolactone Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  escitalopram: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N06AB10",
      label: "WHO ATC/DDD Index — N06AB10 (escitalopram)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=54c98db4-3430-4423-afce-1262810336ae",
      label: "Escitalopram Oxalate Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  fluoxetine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N06AB03",
      label: "WHO ATC/DDD Index — N06AB03 (fluoxetine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4e4d8017-9c1d-41eb-affb-8046e3548be9",
      label: "Fluoxetine Hydrochloride Capsule — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  duloxetine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N06AX21",
      label: "WHO ATC/DDD Index — N06AX21 (duloxetine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=177ce798-3924-416b-ba37-23dfa911a43b",
      label: "Duloxetine Hydrochloride Delayed-Release Capsule — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  venlafaxine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N06AX16",
      label: "WHO ATC/DDD Index — N06AX16 (venlafaxine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=85d3ce8b-8966-45d9-bdaf-f6f0475096e1",
      label: "Venlafaxine Hydrochloride Extended-Release Capsule — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  quetiapine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N05AH04",
      label: "WHO ATC/DDD Index — N05AH04 (quetiapine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=94a81681-381e-4b3b-89ac-e86dcbe7f890",
      label: "Quetiapine Fumarate Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  pregabalin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=N02BF02",
      label: "WHO ATC/DDD Index — N02BF02 (pregabalin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=13d03119-e49b-482e-b5f9-d40dc3f4862e",
      label: "Pregabalin Capsule — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  ciprofloxacin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=J01MA02",
      label: "WHO ATC/DDD Index — J01MA02 (ciprofloxacin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8f6e4a86-5fc1-45b1-adab-25a81f93cb05",
      label: "Ciprofloxacin Hydrochloride Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  azithromycin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=J01FA10",
      label: "WHO ATC/DDD Index — J01FA10 (azithromycin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6c4ce016-e728-4d9a-b1c9-ffd2a8d15607",
      label: "Azithromycin Tablet, film coated — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  clarithromycin: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=J01FA09",
      label: "WHO ATC/DDD Index — J01FA09 (clarithromycin)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f3a50f13-b028-4135-8f20-bfb62a9bc0a9",
      label: "Clarithromycin Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  doxycycline: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=J01AA02",
      label: "WHO ATC/DDD Index — J01AA02 (doxycycline)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=131af052-0c4f-4a61-ae9a-e6165ae09076",
      label: "Doxycycline Hyclate Capsule — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  ceftriaxone: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=J01DD04",
      label: "WHO ATC/DDD Index — J01DD04 (ceftriaxone)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4c5c2d3f-5038-41a1-a2fe-4dcd048dbac1",
      label: "Ceftriaxone Sodium Injection, solution — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  metronidazole: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=J01XD01",
      label: "WHO ATC/DDD Index — J01XD01 (metronidazole)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d5784eeb-6b99-4e8a-847b-b0d1090ed48a",
      label: "Metronidazole Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  naproxen: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=M01AE02",
      label: "WHO ATC/DDD Index — M01AE02 (naproxen)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=50954ade-19ad-40dd-8e06-0b33394895f7",
      label: "Naproxen / Naproxen Sodium Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  diclofenac: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=M01AB05",
      label: "WHO ATC/DDD Index — M01AB05 (diclofenac)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ac2b4060-a5da-4ddf-a734-2ff58a1f98c9",
      label: "Diclofenac Sodium Tablet, delayed release — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  meloxicam: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=M01AC06",
      label: "WHO ATC/DDD Index — M01AC06 (meloxicam)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4ec9bf84-d0b0-4092-8e3d-c67ccfb2780b",
      label: "Meloxicam Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  colchicine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=M04AC01",
      label: "WHO ATC/DDD Index — M04AC01 (colchicine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=94bee24f-d846-4344-bc42-b2eae6b433ba",
      label: "Colchicine Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  allopurinol: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=M04AA01",
      label: "WHO ATC/DDD Index — M04AA01 (allopurinol)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b6c5b5c0-b1cb-44c0-a849-5d317e6fa300",
      label: "Allopurinol Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  montelukast: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=R03DC03",
      label: "WHO ATC/DDD Index — R03DC03 (montelukast)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c0daaaf3-6717-4a01-e053-2995a90af2d8",
      label: "Montelukast Sodium Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  levocetirizine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=R06AE09",
      label: "WHO ATC/DDD Index — R06AE09 (levocetirizine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8d416349-161d-4232-b6b4-e75214ea4841",
      label: "Levocetirizine Dihydrochloride Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
  desloratadine: {
    atcSource: {
      url: "https://atcddd.fhi.no/atc_ddd_index/?code=R06AX27",
      label: "WHO ATC/DDD Index — R06AX27 (desloratadine)",
    },
    labelSource: {
      url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=36307c2b-6b6a-46a9-9fe4-1798fc72e7b8",
      label: "Desloratadine Tablet — FDA label",
      registry: "FDA DailyMed",
    },
    verifiedOn: "2026-09-20",
  },
};
