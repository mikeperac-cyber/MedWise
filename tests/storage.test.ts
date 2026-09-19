import { describe, it, expect, beforeEach } from "vitest";
import {
  loadFromStorage,
  saveRegimen,
  saveHydration,
  saveByok,
  evaluateDailyStreak,
  buildBackupPayload,
  parseImportBackup,
  STORAGE_KEYS,
} from "../src/services/storage";
import type { AppState, RegimenItem } from "../src/types";

// Simple in-memory Storage implementation for Vitest
class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

describe("Storage Services", () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
  });

  describe("loadFromStorage & safe fallback", () => {
    it("returns empty object if storage has no entries", () => {
      const result = loadFromStorage(mockStorage);
      expect(result.regimen).toBeUndefined();
      expect(result.hydration).toBeUndefined();
      expect(result.streak).toBeUndefined();
    });

    it("safely handles corrupted JSON in localStorage", () => {
      mockStorage.setItem(STORAGE_KEYS.REGIMEN, "invalid-json{{{");
      mockStorage.setItem(STORAGE_KEYS.HYDRATION, "{corrupt");

      const result = loadFromStorage(mockStorage);
      expect(result.regimen).toBeUndefined();
      expect(result.hydration).toBeUndefined();
    });

    it("parses valid stored data correctly", () => {
      const mockRegimen: RegimenItem[] = [
        {
          id: "r1",
          compound: "Amlodipin",
          dose: "5mg",
          time: "09:00",
          note: "",
          status: "taken",
        },
      ];
      mockStorage.setItem(STORAGE_KEYS.REGIMEN, JSON.stringify(mockRegimen));
      mockStorage.setItem(STORAGE_KEYS.HYDRATION, JSON.stringify({ current: 1500, target: 2500 }));
      mockStorage.setItem(STORAGE_KEYS.STREAK, "15");

      const result = loadFromStorage(mockStorage);
      expect(result.regimen).toEqual(mockRegimen);
      expect(result.hydration?.current).toBe(1500);
      expect(result.streak).toBe(15);
    });
  });

  describe("save helpers", () => {
    it("persists regimen, hydration, and byok", () => {
      saveRegimen(
        [
          {
            id: "d1",
            compound: "Metformin",
            dose: "1000mg",
            time: "12:00",
            note: "",
            status: "pending",
          },
        ],
        mockStorage
      );
      expect(mockStorage.getItem(STORAGE_KEYS.REGIMEN)).toContain("Metformin");

      saveHydration({ current: 2000, target: 2500 }, mockStorage);
      expect(mockStorage.getItem(STORAGE_KEYS.HYDRATION)).toContain("2000");

      saveByok({ provider: "gemini", apiKey: "test-key" }, mockStorage);
      expect(mockStorage.getItem(STORAGE_KEYS.BYOK)).toContain("test-key");
    });
  });

  describe("evaluateDailyStreak", () => {
    it("initializes active date if first time", () => {
      const mockState: AppState = {
        drugs: [],
        currentDrug: null,
        regimen: [],
        hydration: { current: 1000, target: 2500 },
        streak: 1,
        byok: { provider: "gemini", apiKey: "" },
        selectedEngine: "gemini",
      };

      evaluateDailyStreak(mockState, "2026-09-18", mockStorage);
      expect(mockStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE)).toBe("2026-09-18");
    });

    it("increments streak when 1 day passes with good adherence (>= 60%)", () => {
      mockStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, "2026-09-17");

      const mockState: AppState = {
        drugs: [],
        currentDrug: null,
        regimen: [
          {
            id: "1",
            compound: "A",
            dose: "10mg",
            time: "08:00",
            note: "",
            status: "taken",
          },
        ],
        hydration: { current: 2000, target: 2500 },
        streak: 5,
        byok: { provider: "gemini", apiKey: "" },
        selectedEngine: "gemini",
      };

      evaluateDailyStreak(mockState, "2026-09-18", mockStorage);
      expect(mockState.streak).toBe(6);
      expect(mockState.hydration.current).toBe(0); // Resets for new day
      expect(mockState.regimen[0].status).toBe("pending"); // Resets doses for new day
    });

    it("resets streak to 1 when more than 1 day is missed", () => {
      mockStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, "2026-09-10");

      const mockState: AppState = {
        drugs: [],
        currentDrug: null,
        regimen: [],
        hydration: { current: 1000, target: 2500 },
        streak: 20,
        byok: { provider: "gemini", apiKey: "" },
        selectedEngine: "gemini",
      };

      evaluateDailyStreak(mockState, "2026-09-18", mockStorage);
      expect(mockState.streak).toBe(1);
    });
  });

  describe("Backup & Restore JSON", () => {
    it("generates valid backup JSON payload and imports it correctly", () => {
      const mockState: AppState = {
        drugs: [],
        currentDrug: null,
        regimen: [
          {
            id: "1",
            compound: "Aspirin",
            dose: "100mg",
            time: "21:00",
            note: "",
            status: "taken",
          },
        ],
        hydration: { current: 1800, target: 2500 },
        streak: 10,
        byok: { provider: "gpt4o", apiKey: "secret-key" },
        selectedEngine: "gpt4o",
      };

      const jsonStr = buildBackupPayload(mockState);
      expect(jsonStr).toContain("Aspirin");
      expect(jsonStr).toContain("1800");

      const imported = parseImportBackup(jsonStr);
      expect(imported?.regimen).toHaveLength(1);
      expect(imported?.hydration?.current).toBe(1800);
      expect(imported?.streak).toBe(10);
      expect(imported?.byok?.provider).toBe("gpt4o");
    });

    it("returns null on invalid backup JSON", () => {
      expect(parseImportBackup("not a json string")).toBeNull();
    });

    it("parses partial backup payloads without crashing", () => {
      const partialJson = JSON.stringify({
        data: {
          streak: 25,
        },
      });
      const imported = parseImportBackup(partialJson);
      expect(imported?.streak).toBe(25);
      expect(imported?.regimen).toBeUndefined();
    });

    it("handles streak calculation across month boundaries (e.g. Aug 31 to Sep 1)", () => {
      mockStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, "2026-08-31");

      const mockState: AppState = {
        drugs: [],
        currentDrug: null,
        regimen: [{ id: "1", compound: "A", dose: "1", time: "1", note: "", status: "taken" }],
        hydration: { current: 1500, target: 2500 },
        streak: 12,
        byok: { provider: "gemini", apiKey: "" },
        selectedEngine: "gemini",
      };

      evaluateDailyStreak(mockState, "2026-09-01", mockStorage);
      expect(mockState.streak).toBe(13);
      expect(mockStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE)).toBe("2026-09-01");
    });
  });
});
