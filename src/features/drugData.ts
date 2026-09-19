/**
 * Corpus loading, shared by every page that needs drug records.
 *
 * Split out of `encyclopedia.ts` deliberately. When the interaction,
 * chronobiology and portfolio pages imported `loadDrugDatabase` from the
 * encyclopedia module, they dragged the entire monograph renderer into their
 * bundles and inherited its DOM contract — the per-page contract test caught
 * pages reaching for `mono-pill-left` and friends that they never render.
 *
 * Keeping the loader here means a page pays only for what it actually uses.
 */

import { state } from "../state.ts";
import { getBuiltinDrugRegistry } from "../constants/builtinDrugs.ts";

let inFlight: Promise<void> | null = null;

async function fetchCorpus(): Promise<void> {
  try {
    const response = await fetch("/drugs.json");
    if (!response.ok) throw new Error(`Database fetch status: ${response.status}`);
    state.drugs = await response.json();
  } catch (err) {
    console.warn("drugs.json could not be loaded; using the built-in registry.", err);
    state.drugs = getBuiltinDrugRegistry();
  }
}

/** Loads the corpus once per page load; repeat callers share the same promise. */
export function loadDrugDatabase(): Promise<void> {
  inFlight ??= fetchCorpus();
  return inFlight;
}
