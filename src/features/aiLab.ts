/**
 * BYOK AI Lab page.
 *
 * Three honesty fixes carried over from the review of the previous build:
 *
 *  - No local fallback. Without an API key the run button is disabled and the
 *    panel explains why, instead of silently serving canned text as analysis.
 *  - Model output is rendered as text, never as HTML. The old renderer assigned
 *    the response straight to `innerHTML`, so a model (or a malicious echo of
 *    the user's own prompt) could inject markup.
 *  - The latency badge reports elapsed milliseconds only. It used to append
 *    "Doğrulandı" ("verified"), which nothing in the code ever did.
 */

import { state } from "../state.ts";
import type { ByokProvider } from "../types/index.ts";
import { callProvider, PROVIDER_LABELS, ProviderError } from "../services/ai.ts";
import { byId, showToast } from "../shell/shell.ts";

let running = false;

function keyPresent(): boolean {
  return Boolean(state.byok.apiKey && state.byok.apiKey.trim().length > 5);
}

/** Enables or disables the run control based on whether a key is configured. */
export function syncAiAvailability(): void {
  const hasKey = keyPresent();

  const runBtn = byId<HTMLButtonElement>("ai-run-btn");
  if (runBtn) {
    runBtn.disabled = !hasKey || running;
    runBtn.classList.toggle("opacity-40", !hasKey);
    runBtn.classList.toggle("cursor-not-allowed", !hasKey);
    runBtn.title = hasKey ? "" : "Önce kendi API anahtarınızı ekleyin.";
  }

  const promptBox = byId<HTMLTextAreaElement>("ai-prompt-box");
  if (promptBox) {
    promptBox.disabled = !hasKey;
    promptBox.placeholder = hasKey
      ? "Farmakoloji sorunuzu yazın..."
      : "Bu özelliği kullanmak için kendi API anahtarınızı ekleyin.";
  }

  const notice = byId("ai-key-notice");
  if (notice) notice.classList.toggle("hidden", hasKey);

  const activeName = byId("active-model-name");
  if (activeName) {
    activeName.textContent = hasKey ? PROVIDER_LABELS[state.byok.provider] : "Kapalı";
  }
}

export function selectModel(modelKey: ByokProvider): void {
  state.selectedEngine = modelKey;
  state.byok.provider = modelKey;

  const tabs = Array.from(document.querySelectorAll<HTMLElement>("#engine-selector button"));
  tabs.forEach((tab) => {
    const isActive = tab.dataset.provider === modelKey;
    tab.className = isActive
      ? "flex-1 py-1.5 rounded-lg bg-white font-bold text-primary shadow-xs"
      : "flex-1 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-medium";
    tab.setAttribute("aria-pressed", String(isActive));
  });

  syncAiAvailability();
}

export function setAiQuery(query: string): void {
  const input = byId<HTMLTextAreaElement>("ai-prompt-box");
  if (!input) return;
  input.value = query;
  input.focus();
}

/** Renders a provider response. Text only, one paragraph per blank-line block. */
function renderAiResponse(content: string, latencyMs: number): void {
  const box = byId("ai-response-text");
  if (!box) return;

  box.textContent = "";
  content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .forEach((block) => {
      const p = document.createElement("p");
      p.className = "text-xs text-on-surface leading-relaxed mb-2 whitespace-pre-line";
      p.textContent = block;
      box.appendChild(p);
    });

  const latency = byId("ai-latency-indicator");
  if (latency) latency.textContent = `${latencyMs} ms`;
}

function renderAiError(message: string): void {
  const box = byId("ai-response-text");
  if (!box) return;

  box.textContent = "";
  const wrap = document.createElement("div");
  wrap.className =
    "p-3 rounded-xl bg-error-container/40 border border-error/40 text-xs text-on-error-container";
  wrap.setAttribute("role", "alert");
  wrap.textContent = message;
  box.appendChild(wrap);

  const latency = byId("ai-latency-indicator");
  if (latency) latency.textContent = "hata";
}

export async function executeAiRun(): Promise<void> {
  const promptInput = byId<HTMLTextAreaElement>("ai-prompt-box");
  const prompt = promptInput?.value.trim();
  const box = byId("ai-response-text");
  if (!prompt || !box) return;

  if (!keyPresent()) {
    showToast("Önce kendi API anahtarınızı ekleyin.", "warning");
    return;
  }

  running = true;
  syncAiAvailability();

  box.innerHTML = `
    <div class="animate-pulse space-y-2" aria-hidden="true">
      <div class="h-3 bg-surface-container rounded w-3/4"></div>
      <div class="h-3 bg-surface-container rounded w-full"></div>
      <div class="h-3 bg-surface-container rounded w-5/6"></div>
    </div>
  `;
  const latency = byId("ai-latency-indicator");
  if (latency) latency.textContent = "çalışıyor...";

  const started = Date.now();
  try {
    const text = await callProvider(state.byok.provider, prompt, state.byok.apiKey);
    renderAiResponse(text, Date.now() - started);
  } catch (err) {
    const detail =
      err instanceof ProviderError
        ? `${PROVIDER_LABELS[err.provider]} isteği başarısız oldu (${err.status}).`
        : "Sağlayıcıya bağlanılamadı.";
    renderAiError(
      `${detail} Anahtarınızı ve internet bağlantınızı kontrol edin. ` +
        "Bu panelin yerel bir yedek motoru yoktur; yanıt yalnızca sizin " +
        "sağlayıcınızdan gelir."
    );
    console.warn("BYOK provider call failed:", err);
  } finally {
    running = false;
    syncAiAvailability();
  }
}

export function copyAiResponse(): void {
  const box = byId("ai-response-text");
  const text = box?.innerText?.trim();
  if (!text) return;

  void navigator.clipboard
    .writeText(text)
    .then(() => {
      const icon = byId("copy-ai-icon");
      if (icon) {
        icon.textContent = "check";
        icon.classList.add("text-emerald-600");
        setTimeout(() => {
          icon.textContent = "content_copy";
          icon.classList.remove("text-emerald-600");
        }, 1600);
      }
      showToast("Yanıt panoya kopyalandı.", "success");
    })
    .catch(() => showToast("Kopyalama başarısız oldu.", "error"));
}

export function initAiLab(): void {
  Object.assign(window, { selectModel, setAiQuery, executeAiRun, copyAiResponse });

  selectModel(state.byok.provider || "gemini");
  syncAiAvailability();

  byId("ai-prompt-box")?.addEventListener("keydown", (event) => {
    const e = event as KeyboardEvent;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void executeAiRun();
    }
  });
}
