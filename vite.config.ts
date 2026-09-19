import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const ROOT = __dirname;

/**
 * Resolves `<!--@include path/to/fragment.html -->` directives inside HTML
 * entry points at build time, so the six pages share one copy of the header,
 * footer and overlay markup without shipping a client-side templating step.
 *
 * Includes are resolved recursively (depth-capped) and the result is fully
 * static, which keeps the shared chrome in the served document instead of
 * painting it in after the first render.
 */
function htmlIncludes(): Plugin {
  const DIRECTIVE = /<!--@include\s+([^\s>]+)\s*-->/g;
  const MAX_DEPTH = 5;

  function expand(html: string, depth: number, seen: string[]): string {
    if (depth > MAX_DEPTH) {
      throw new Error(`@include nesting exceeded ${MAX_DEPTH} levels: ${seen.join(" -> ")}`);
    }
    return html.replace(DIRECTIVE, (_match, rawPath: string) => {
      const target = resolve(ROOT, rawPath);
      if (!target.startsWith(ROOT)) {
        throw new Error(`@include escapes project root: ${rawPath}`);
      }
      let fragment: string;
      try {
        fragment = readFileSync(target, "utf8");
      } catch {
        throw new Error(`@include target not found: ${rawPath}`);
      }
      return expand(fragment, depth + 1, [...seen, rawPath]);
    });
  }

  return {
    name: "medwise-html-includes",
    enforce: "pre",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return expand(html, 0, ["<entry>"]);
      },
    },
    configureServer(server) {
      // Partials are not module-graph members, so a change to one has to force
      // a reload manually or the dev server keeps serving stale chrome.
      server.watcher.add(resolve(ROOT, "partials"));
      server.watcher.on("change", (file) => {
        const normalised = file.replace(/\\/g, "/");
        if (normalised.includes("/partials/") || normalised.endsWith(".page.html")) {
          server.ws.send({ type: "full-reload", path: "*" });
        }
      });
    },
  };
}

const PAGES = ["index", "ansiklopedi", "etkilesim", "kronobiyoloji", "yapay-zeka", "portfolyo"];

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === "analyze";

  return {
    appType: "mpa",
    plugins: [
      htmlIncludes(),
      visualizer({
        filename: "dist/stats.html",
        title: "MedWise Production Bundle Analysis",
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
    ],
    build: {
      target: "es2022",
      sourcemap: isAnalyze,
      cssCodeSplit: true,
      minify: "esbuild",
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        input: Object.fromEntries(PAGES.map((p) => [p, resolve(ROOT, `${p}.html`)])),
        output: {
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
        },
      },
    },
    server: {
      port: 5173,
      open: false,
    },
  };
});
