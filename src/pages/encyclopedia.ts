/**
 * Page entry: İlaç Ansiklopedisi
 *
 * Thin by design. Shared chrome comes from the shell; the behaviour lives in
 * src/features. Each page is its own Vite entry point, so a visitor downloads
 * only the code for the page they opened.
 */

import { initShell, onReady } from "../shell/shell.ts";
import { initEncyclopedia } from "../features/encyclopedia.ts";

onReady(() => {
  initShell();
  void initEncyclopedia();
});
