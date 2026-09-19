/**
 * Page entry: Çapraz Etkileşim
 *
 * Thin by design. Shared chrome comes from the shell; the behaviour lives in
 * src/features. Each page is its own Vite entry point, so a visitor downloads
 * only the code for the page they opened.
 */

import { initShell, onReady } from "../shell/shell.ts";
import { loadDrugDatabase } from "../features/drugData.ts";
import { initInteractionLab } from "../features/interactionLab.ts";

onReady(() => {
  initShell();
  initInteractionLab(loadDrugDatabase());
});
