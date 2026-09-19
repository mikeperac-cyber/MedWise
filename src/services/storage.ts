import type {
  AppState,
  RegimenItem,
  HydrationState,
  ByokState,
  BackupPayload,
} from "../types/index.ts";

export const STORAGE_KEYS = {
  REGIMEN: "medwise_regimen",
  HYDRATION: "medwise_hydration",
  STREAK: "medwise_streak",
  BYOK: "medwise_byok",
  LAST_ACTIVE_DATE: "medwise_last_active_date",
} as const;

export interface LoadedStorageData {
  regimen?: RegimenItem[];
  hydration?: HydrationState;
  streak?: number;
  byok?: ByokState;
}

/**
 * Safely loads user data from localStorage.
 */
export function loadFromStorage(storage: Storage = window.localStorage): LoadedStorageData {
  const result: LoadedStorageData = {};

  try {
    const savedRegimen = storage.getItem(STORAGE_KEYS.REGIMEN);
    if (savedRegimen) {
      const parsed = JSON.parse(savedRegimen);
      if (Array.isArray(parsed) && parsed.length > 0) {
        result.regimen = parsed;
      }
    }

    const savedHydration = storage.getItem(STORAGE_KEYS.HYDRATION);
    if (savedHydration) {
      result.hydration = JSON.parse(savedHydration);
    }

    const savedStreak = storage.getItem(STORAGE_KEYS.STREAK);
    if (savedStreak) {
      const parsed = parseInt(savedStreak, 10);
      if (!isNaN(parsed)) {
        result.streak = parsed;
      }
    }

    const savedByok = storage.getItem(STORAGE_KEYS.BYOK);
    if (savedByok) {
      result.byok = JSON.parse(savedByok);
    }
  } catch (err) {
    console.warn("Storage restore fallback:", err);
  }

  return result;
}

/**
 * Saves regimen items into localStorage.
 */
export function saveRegimen(regimen: RegimenItem[], storage: Storage = window.localStorage): void {
  try {
    storage.setItem(STORAGE_KEYS.REGIMEN, JSON.stringify(regimen));
  } catch (err) {
    console.warn("Failed to persist regimen to localStorage:", err);
  }
}

/**
 * Saves hydration state into localStorage.
 */
export function saveHydration(
  hydration: HydrationState,
  storage: Storage = window.localStorage
): void {
  try {
    storage.setItem(STORAGE_KEYS.HYDRATION, JSON.stringify(hydration));
  } catch (err) {
    console.warn("Failed to persist hydration to localStorage:", err);
  }
}

/**
 * Saves BYOK settings into localStorage.
 */
export function saveByok(byok: ByokState, storage: Storage = window.localStorage): void {
  try {
    storage.setItem(STORAGE_KEYS.BYOK, JSON.stringify(byok));
  } catch (err) {
    console.warn("Failed to persist BYOK to localStorage:", err);
  }
}

/**
 * Checks and updates daily streak & schedule resets.
 */
export function evaluateDailyStreak(
  state: AppState,
  currentDateStr: string = new Date().toISOString().slice(0, 10),
  storage: Storage = window.localStorage
): void {
  try {
    const lastActiveDate = storage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE);

    if (!lastActiveDate) {
      storage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, currentDateStr);
      return;
    }

    if (lastActiveDate !== currentDateStr) {
      const lastDate = new Date(lastActiveDate);
      const today = new Date(currentDateStr);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      const totalDoses = state.regimen.length;
      const takenDoses = state.regimen.filter((d) => d.status === "taken").length;
      const yesterdayAdherence = totalDoses > 0 ? takenDoses / totalDoses : 0;

      if (diffDays === 1) {
        if (yesterdayAdherence >= 0.6) {
          state.streak += 1;
        }
      } else if (diffDays > 1) {
        state.streak = 1;
      }

      // Reset dose statuses for fresh day
      state.regimen.forEach((d) => {
        d.status = "pending";
      });

      state.hydration.current = 0;

      storage.setItem(STORAGE_KEYS.STREAK, state.streak.toString());
      saveHydration(state.hydration, storage);
      saveRegimen(state.regimen, storage);
      storage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, currentDateStr);
    }
  } catch (e) {
    console.warn("Streak check error:", e);
  }
}

/**
 * Builds backup payload JSON string.
 */
export function buildBackupPayload(state: AppState): string {
  const payload: BackupPayload = {
    version: "2.4.0",
    timestamp: new Date().toISOString(),
    data: {
      regimen: state.regimen,
      hydration: state.hydration,
      streak: state.streak,
      byok: {
        provider: state.byok.provider,
      },
    },
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validates and restores imported JSON backup payload.
 */
export function parseImportBackup(jsonStr: string): Partial<LoadedStorageData> | null {
  try {
    const parsed = JSON.parse(jsonStr);
    const data = parsed.data || parsed;
    const result: Partial<LoadedStorageData> = {};

    if (Array.isArray(data.regimen)) {
      result.regimen = data.regimen;
    }
    if (data.hydration && typeof data.hydration.current === "number") {
      result.hydration = data.hydration;
    }
    if (typeof data.streak === "number") {
      result.streak = data.streak;
    }
    if (data.byok && data.byok.provider) {
      result.byok = {
        provider: data.byok.provider,
        apiKey: "", // Never overwrite with empty if we want to preserve key
      };
    }

    return result;
  } catch {
    return null;
  }
}
