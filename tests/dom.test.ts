import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Per-page DOM contract.
 *
 * The single-page build could check one HTML file against one script. Now there
 * are six documents, each pulling in shared partials and its own feature
 * modules, so a mismatch can hide on a page you did not open. These tests
 * resolve the same `@include` directives the Vite plugin resolves, walk each
 * page's import graph, and assert that every element the page's code reaches
 * for actually exists in that page's markup.
 *
 * This is the test that catches "works on the cockpit, silently dead on
 * chronobiology" — the exact class of bug the multi-page split introduces.
 */

const ROOT = path.resolve(__dirname, "..");

const PAGES = [
  { html: "index.html", entry: "src/pages/cockpit.ts", route: "kokpit" },
  { html: "ansiklopedi.html", entry: "src/pages/encyclopedia.ts", route: "ansiklopedi" },
  { html: "etkilesim.html", entry: "src/pages/interactions.ts", route: "etkilesim" },
  { html: "kronobiyoloji.html", entry: "src/pages/chronobiology.ts", route: "kronobiyoloji" },
  { html: "yapay-zeka.html", entry: "src/pages/ailab.ts", route: "yapay-zeka" },
  { html: "portfolyo.html", entry: "src/pages/portfolio.ts", route: "portfolyo" },
];

const INCLUDE = /<!--@include\s+([^\s>]+)\s*-->/g;

/** Mirrors the `htmlIncludes` plugin in vite.config.ts. */
function resolveIncludes(html: string, depth = 0): string {
  if (depth > 5) throw new Error("include nesting too deep");
  return html.replace(INCLUDE, (_m, rel: string) =>
    resolveIncludes(fs.readFileSync(path.resolve(ROOT, rel), "utf-8"), depth + 1)
  );
}

function readPage(file: string): string {
  return resolveIncludes(fs.readFileSync(path.resolve(ROOT, file), "utf-8"));
}

/** Follows relative imports from an entry to collect that page's real code. */
function collectModules(entry: string, seen = new Set<string>()): string[] {
  const abs = path.resolve(ROOT, entry);
  if (seen.has(abs) || !fs.existsSync(abs)) return [];
  seen.add(abs);

  const source = fs.readFileSync(abs, "utf-8");
  const out = [source];

  const importRe = /from\s+["'](\.[^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(source)) !== null) {
    const spec = m[1];
    if (!spec.endsWith(".ts")) continue; // .json and .css carry no DOM contract
    out.push(...collectModules(path.relative(ROOT, path.resolve(path.dirname(abs), spec)), seen));
  }
  return out;
}

function idsIn(html: string): Set<string> {
  const ids = new Set<string>();
  const re = /\sid=["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  return ids;
}

describe("Per-page DOM contract", () => {
  for (const page of PAGES) {
    describe(page.html, () => {
      const html = readPage(page.html);
      const code = collectModules(page.entry).join("\n");

      it("declares its route on <body> so the shell can highlight the right tab", () => {
        expect(html).toContain(`data-route="${page.route}"`);
      });

      it("loads only its own entry script", () => {
        expect(html).toContain(`src="/src/pages/${path.basename(page.entry, ".ts")}.ts"`);
        expect(html).not.toContain("/src/main.ts");
      });

      it("includes the shared chrome exactly once", () => {
        expect(html.match(/id="toast-container"/g) ?? []).toHaveLength(1);
        expect(html.match(/id="disclaimer-modal"/g) ?? []).toHaveLength(1);
        expect(html.match(/id="byok-modal"/g) ?? []).toHaveLength(1);
        // No unresolved directives may reach the browser.
        expect(html).not.toContain("@include");
      });

      it("every element the page's code looks up exists in the page's markup", () => {
        const available = idsIn(html);
        const queried = new Set<string>();

        // byId("x") from the shell helper, plus any direct getElementById.
        const re = /(?:byId(?:<[^>]*>)?|document\.getElementById)\(\s*["']([^"']+)["']/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(code)) !== null) queried.add(m[1]);

        // IDs created at runtime by the page's own renderers are legitimately absent.
        const runtimeCreated = new Set(["chrono-drug-picker"]);

        const missing = [...queried].filter((id) => !available.has(id) && !runtimeCreated.has(id));
        expect(
          missing,
          `${page.html}: code queries IDs that the page does not render: ${missing.join(", ")}`
        ).toEqual([]);
      });

      it("every inline handler in the markup is registered on window by the page's code", () => {
        const handlerRe =
          /\bon(?:click|submit|change|input)\s*=\s*["'](?:if\([^)]*\)\s*)?([a-zA-Z0-9_$]+)\s*\(/g;
        // `window.print()` and friends belong to the platform, not to us.
        const builtins = new Set(["if", "for", "while", "switch", "alert", "print", "close"]);

        const handlers = new Set<string>();
        let m: RegExpExecArray | null;
        while ((m = handlerRe.exec(html)) !== null) {
          if (!builtins.has(m[1])) handlers.add(m[1]);
        }

        const exposed = (fn: string): boolean =>
          code.includes(`export function ${fn}`) ||
          code.includes(`export async function ${fn}`) ||
          code.includes(`export const ${fn}`) ||
          new RegExp(`Object\\.assign\\(window,[\\s\\S]{0,600}?\\b${fn}\\b`).test(code);

        const missing = [...handlers].filter((fn) => !exposed(fn));

        expect(
          missing,
          `${page.html}: markup calls handlers the page never exposes: ${missing.join(", ")}`
        ).toEqual([]);
      });

      it("exposes a skip link and a focusable main landmark", () => {
        expect(html).toContain('class="skip-link"');
        expect(html).toContain('id="page-main"');
      });
    });
  }

  it("all six entry points are registered in the Vite build", () => {
    const config = fs.readFileSync(path.resolve(ROOT, "vite.config.ts"), "utf-8");
    for (const page of PAGES) {
      expect(config).toContain(path.basename(page.html, ".html"));
    }
  });

  it("public assets referenced by the shell exist", () => {
    expect(fs.existsSync(path.resolve(ROOT, "public/favicon.svg"))).toBe(true);
    expect(fs.existsSync(path.resolve(ROOT, "public/drugs.json"))).toBe(true);
  });

  it("the retired single-page modules are gone", () => {
    expect(fs.existsSync(path.resolve(ROOT, "src/main.ts"))).toBe(false);
    expect(fs.existsSync(path.resolve(ROOT, "src/router.ts"))).toBe(false);
  });
});
