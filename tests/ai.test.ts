import { describe, it, expect, vi, afterEach } from "vitest";
import * as ai from "../src/services/ai.ts";

/**
 * The previous version of this file tested
 * `generateSmartLocalPharmacologyResponse` — a keyword matcher that returned
 * canned dosing advice and was presented to users as clinical analysis. Both
 * the function and its tests are gone.
 *
 * What is worth testing now is the opposite property: that the module offers no
 * offline fallback at all, and that a provider failure surfaces as an error the
 * UI can report rather than being quietly swallowed.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response: unknown, ok = true, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok,
      status,
      statusText: ok ? "OK" : "Unauthorized",
      json: async () => response,
    }))
  );
}

describe("BYOK provider layer", () => {
  it("exposes no local fallback generator", () => {
    expect("generateSmartLocalPharmacologyResponse" in ai).toBe(false);
  });

  it("instructs the model not to issue dosing orders and not to invent facts", () => {
    expect(ai.SYSTEM_INSTRUCTION).toContain("Kesin doz talimatı verme");
    expect(ai.SYSTEM_INSTRUCTION).toContain("uydurma");
  });

  it("keeps one model id per provider", () => {
    expect(Object.keys(ai.PROVIDER_MODELS).sort()).toEqual(["claude", "gemini", "gpt4o"]);
    for (const model of Object.values(ai.PROVIDER_MODELS)) {
      expect(model.length).toBeGreaterThan(0);
    }
  });

  it("returns the text of a successful Gemini response", async () => {
    stubFetch({ candidates: [{ content: { parts: [{ text: "yanıt" }] } }] });
    await expect(ai.callGeminiApi("soru", "key-123")).resolves.toBe("yanıt");
  });

  it("returns the text of a successful OpenAI response", async () => {
    stubFetch({ choices: [{ message: { content: "yanıt" } }] });
    await expect(ai.callOpenAiApi("soru", "key-123")).resolves.toBe("yanıt");
  });

  it("returns the text of a successful Claude response", async () => {
    stubFetch({ content: [{ text: "yanıt" }] });
    await expect(ai.callClaudeApi("soru", "key-123")).resolves.toBe("yanıt");
  });

  it("sends the browser-access header Anthropic actually recognises", async () => {
    stubFetch({ content: [{ text: "ok" }] });
    await ai.callClaudeApi("soru", "key-123");

    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    expect(headers).not.toHaveProperty("dangerously-allow-browser");
  });

  it("throws ProviderError with the status when a provider rejects the call", async () => {
    stubFetch({}, false, 401);
    await expect(ai.callGeminiApi("soru", "bad-key")).rejects.toBeInstanceOf(ai.ProviderError);
    await expect(ai.callGeminiApi("soru", "bad-key")).rejects.toMatchObject({
      provider: "gemini",
      status: 401,
    });
  });

  it("throws rather than inventing text when a provider returns an empty body", async () => {
    stubFetch({ candidates: [] });
    await expect(ai.callGeminiApi("soru", "key-123")).rejects.toBeInstanceOf(ai.ProviderError);
  });

  it("routes each provider through callProvider", async () => {
    stubFetch({ content: [{ text: "c" }] });
    await expect(ai.callProvider("claude", "soru", "key-123")).resolves.toBe("c");
  });
});
