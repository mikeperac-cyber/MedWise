export interface PillGeometry {
  shape: string;
  dimensions: string;
  imprint: string;
  colorLeft: string;
  colorRight: string;
  textLeft: string;
  textRight: string;
}

export interface SvgMolecule {
  viewBox: string;
  type: string;
}

export interface Pharmacokinetics {
  tMax: string;
  halfLife: string;
  bioavailability: string;
  metabolismPathway: string;
  clearance: string;
}

export type InteractionSeverity = "severe" | "warning" | "mild" | string;

export interface Interaction {
  severity: InteractionSeverity;
  title: string;
  badge: string;
  description: string;
}

export interface Chronotherapy {
  idealTime: string;
  rationale: string;
}

export interface Drug {
  id: string;
  name: string;
  genericNameTR: string;
  genericNameUS: string;
  brandTR: string[];
  brandUS: string[];
  category: string;
  rxType: string;
  atc: string;
  ndc: string;
  titck: string;
  description: string;
  dosageForms: string;
  formula: string;
  chirality: string;
  pillGeometry: PillGeometry;
  svgMolecule: SvgMolecule;
  pharmacokinetics: Pharmacokinetics;
  interactions: Interaction[];
  chronotherapy: Chronotherapy;
  defaultDose: string;
  commonSchedule: string;
}

export type DoseStatus = "taken" | "pending";

export interface RegimenItem {
  id: string;
  compound: string;
  dose: string;
  time: string;
  note: string;
  status: DoseStatus;
}

export interface HydrationState {
  current: number;
  target: number;
}

export type ByokProvider = "gemini" | "gpt4o" | "claude";

export interface ByokState {
  provider: ByokProvider;
  apiKey: string;
}

export interface AppState {
  drugs: Drug[];
  currentDrug: Drug | null;
  regimen: RegimenItem[];
  hydration: HydrationState;
  streak: number;
  byok: ByokState;
  selectedEngine: ByokProvider;
}

export interface BackupPayload {
  version: string;
  timestamp: string;
  data: {
    regimen: RegimenItem[];
    hydration: HydrationState;
    streak: number;
    byok: {
      provider: ByokProvider;
    };
  };
}
