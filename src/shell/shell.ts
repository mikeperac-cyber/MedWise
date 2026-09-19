/**
 * Shared page chrome for the multi-page app.
 *
 * Every one of the six pages calls `initShell()`. It owns everything that lives
 * outside `<main>`: navigation highlighting, the three modals, the toast stack,
 * BYOK key handling and the local data vault. Page-specific behaviour lives in
 * `src/features/*` and is wired up by the page entry in `src/pages/*`.
 *
 * Replaces the hash router from the single-page build: the active tab is now
 * derived from `document.body.dataset.route`, which each page sets statically,
 * so the correct tab is highlighted in the served HTML rather than after a
 * client-side route resolution.
 */

import "../style.css";

import type { ByokProvider } from "../types/index.ts";
import { state } from "../state.ts";
import { loadFromStorage, saveByok, saveRegimen, saveHydration } from "../services/storage.ts";

const ACTIVE_CLASSES = ["text-primary", "bg-primary-fixed/60", "font-bold", "shadow-2xs"];
const INACTIVE_CLASSES = [
  "text-on-surface-variant",
  "hover:text-primary",
  "hover:bg-surface-container",
  "font-medium",
];

/** Escapes text before it is placed into an innerHTML string. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/**
 * Highlights the nav entry matching `body[data-route]`.
 *
 * The "Akademik Portföy" tab carries its own gradient treatment in the markup,
 * so it is skipped rather than being overwritten with the standard token set.
 */
function highlightActiveRoute(): void {
  const active = document.body.dataset.route;
  if (!active) return;

  document.querySelectorAll<HTMLElement>("[data-nav-route]").forEach((link) => {
    const isPortfolioTab = link.getAttribute("data-nav-route") === "portfolyo";
    const isActive = link.getAttribute("data-nav-route") === active;

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }

    if (isPortfolioTab) return;

    link.classList.remove(...ACTIVE_CLASSES, ...INACTIVE_CLASSES);
    link.classList.add(...(isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES));
  });
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------

export type ToastType = "success" | "info" | "warning" | "error";

const TOAST_ICONS: Record<ToastType, string> = {
  success: "check_circle",
  info: "info",
  warning: "warning",
  error: "error",
};
const TOAST_ICON_COLORS: Record<ToastType, string> = {
  success: "text-primary",
  info: "text-tertiary",
  warning: "text-amber-600",
  error: "text-error",
};
const TOAST_BORDERS: Record<ToastType, string> = {
  success: "border-primary-fixed-dim",
  info: "border-tertiary-fixed",
  warning: "border-amber-300",
  error: "border-error/40",
};

export function showToast(message: string, type: ToastType = "info", duration = 3200): void {
  const container = byId("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto bg-white/95 backdrop-blur-md border ${TOAST_BORDERS[type]} shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 text-xs text-on-surface animate-toastIn`;
  toast.setAttribute("role", "status");

  const icon = document.createElement("span");
  icon.className = `material-symbols-outlined ${TOAST_ICON_COLORS[type]} text-[20px] flex-shrink-0`;
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = TOAST_ICONS[type];

  // textContent rather than innerHTML: toast messages interpolate drug names
  // and imported file contents, which are user-controlled.
  const label = document.createElement("span");
  label.className = "font-medium leading-snug flex-1";
  label.textContent = message;

  toast.append(icon, label);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.replace("animate-toastIn", "animate-toastOut");
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const MODAL_IDS = ["byok-modal", "custom-dose-modal", "disclaimer-modal"];

/** The element that had focus before the current modal opened. */
let focusReturnTarget: HTMLElement | null = null;

export function openModal(id: string): void {
  const modal = byId(id);
  if (!modal) return;

  focusReturnTarget = document.activeElement as HTMLElement | null;
  modal.classList.remove("hidden");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const first = modal.querySelector<HTMLElement>(FOCUSABLE);
  first?.focus();
}

export function closeModal(id: string): void {
  const modal = byId(id);
  if (!modal || modal.classList.contains("hidden")) return;

  modal.classList.add("hidden");
  modal.removeAttribute("aria-modal");
  focusReturnTarget?.focus();
  focusReturnTarget = null;
}

function isOpen(id: string): boolean {
  return byId(id)?.classList.contains("hidden") === false;
}

/** Keeps Tab focus inside whichever modal is open. */
function trapFocus(event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  const openId = MODAL_IDS.find(isOpen);
  if (!openId) return;

  const modal = byId(openId);
  if (!modal) return;

  const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export const openDisclaimerModal = (): void => openModal("disclaimer-modal");
export const closeDisclaimerModal = (): void => closeModal("disclaimer-modal");
export const openCustomDoseModal = (): void => openModal("custom-dose-modal");
export const closeCustomDoseModal = (): void => closeModal("custom-dose-modal");

// ---------------------------------------------------------------------------
// BYOK
// ---------------------------------------------------------------------------

export function updateByokPill(): void {
  const pill = byId("byok-mode-pill");
  if (!pill) return;
  pill.textContent = state.byok.apiKey
    ? `BYOK: ${state.byok.provider.toUpperCase()} aktif`
    : "BYOK: anahtar girilmedi";
}

export function openByokModal(): void {
  const input = byId<HTMLInputElement>("modal-api-key-input");
  const select = byId<HTMLSelectElement>("modal-provider-select");
  if (input) input.value = state.byok.apiKey || "";
  if (select) select.value = state.byok.provider || "gemini";
  openModal("byok-modal");
}

export function closeByokModal(): void {
  closeModal("byok-modal");
}

export function saveApiKey(): void {
  const input = byId<HTMLInputElement>("modal-api-key-input");
  const select = byId<HTMLSelectElement>("modal-provider-select");
  state.byok.apiKey = input?.value.trim() || "";
  state.byok.provider = (select?.value as ByokProvider) || "gemini";
  saveByok(state.byok);
  updateByokPill();
  closeByokModal();
  showToast("Anahtar yalnızca bu tarayıcıya kaydedildi.", "success");
}

export function clearApiKey(): void {
  state.byok.apiKey = "";
  saveByok(state.byok);
  const input = byId<HTMLInputElement>("modal-api-key-input");
  if (input) input.value = "";
  updateByokPill();
  closeByokModal();
  showToast("Anahtar silindi. Yapay zeka özellikleri kapalı.", "info");
}

// ---------------------------------------------------------------------------
// Local data vault
// ---------------------------------------------------------------------------

export function exportData(): void {
  const vault = {
    system: "MedWise",
    version: "3.0.0",
    exportDate: new Date().toISOString(),
    regimen: state.regimen,
    hydration: state.hydration,
    streak: state.streak,
  };

  const blob = new Blob([JSON.stringify(vault, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medwise_yedek_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Verileriniz JSON olarak indirildi.", "success");
}

/**
 * Restores a vault file.
 *
 * `onRestored` lets the calling page re-render whatever it displays, since the
 * cockpit renderers do not exist on, say, the encyclopedia page.
 */
export function importData(event: Event, onRestored?: () => void): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (Array.isArray(data.regimen)) {
        state.regimen = data.regimen;
        saveRegimen(state.regimen);
      }
      if (data.hydration) {
        state.hydration = data.hydration;
        saveHydration(state.hydration);
      }
      if (typeof data.streak === "number") state.streak = data.streak;
      onRestored?.();
      showToast("Yedek geri yüklendi.", "success");
    } catch {
      showToast("Hata: dosya okunamadı, geçersiz yedek.", "error");
    }
  };
  reader.readAsText(file);
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

export interface ShellOptions {
  /** Called after a vault import so the page can re-render. */
  onVaultRestored?: () => void;
}

/**
 * Loads persisted state, wires the shared chrome, and exposes the handlers that
 * the markup calls via inline `onclick`.
 */
export function initShell(options: ShellOptions = {}): void {
  const stored = loadFromStorage();
  if (stored.regimen && stored.regimen.length > 0) state.regimen = stored.regimen;
  if (stored.hydration) state.hydration = stored.hydration;
  if (typeof stored.streak === "number") state.streak = stored.streak;
  if (stored.byok) state.byok = stored.byok;

  highlightActiveRoute();
  updateByokPill();

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeByokModal();
      closeCustomDoseModal();
      closeDisclaimerModal();
    }
    trapFocus(event);
  });

  // Clicking the dimmed backdrop closes the dialog it belongs to.
  MODAL_IDS.forEach((id) => {
    byId(id)?.addEventListener("click", (event) => {
      if (event.target === byId(id)) closeModal(id);
    });
  });

  Object.assign(window, {
    openByokModal,
    closeByokModal,
    saveApiKey,
    clearApiKey,
    openDisclaimerModal,
    closeDisclaimerModal,
    openCustomDoseModal,
    closeCustomDoseModal,
    showToast,
    exportData,
    importData: (event: Event) => importData(event, options.onVaultRestored),
  });
}

/** Runs `fn` once the document is parsed. */
export function onReady(fn: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}
