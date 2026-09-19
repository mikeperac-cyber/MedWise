import type { Drug } from "../types/index.ts";
import coreDrugsJson from "./coreDrugs.json";

export const builtinDrugs: Drug[] = coreDrugsJson as Drug[];

export function getBuiltinDrugRegistry(): Drug[] {
  return builtinDrugs;
}
