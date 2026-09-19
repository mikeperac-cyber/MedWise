import type { AppState } from "./types/index.ts";

/**
 * Initial application state for a first-time visitor.
 *
 * Everything starts empty. The previous build seeded a hardcoded `streak: 14`,
 * three pre-filled doses and 2100ml of hydration, so someone opening MedWise for
 * the very first time was shown two weeks of adherence they had never earned and
 * a medication list that was not theirs. That is demo theatre, and in an app
 * about medication it is actively misleading.
 *
 * Real values are layered on top of this by `loadFromStorage()` in the shell.
 */
export const state: AppState = {
  drugs: [],
  currentDrug: null,
  regimen: [],
  hydration: {
    current: 0,
    target: 2500,
  },
  streak: 0,
  byok: {
    provider: "gemini",
    apiKey: import.meta.env.VITE_DEFAULT_GEMINI_API_KEY || "",
  },
  selectedEngine: "gemini",
};
