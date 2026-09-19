/**
 * Page entry: Doz Kokpiti
 *
 * Thin by design. Shared chrome comes from the shell; the behaviour lives in
 * src/features. Each page is its own Vite entry point, so a visitor downloads
 * only the code for the page they opened.
 */

import { initShell, onReady } from "../shell/shell.ts";
import { initCockpit, refreshCockpit } from "../features/cockpit.ts";

onReady(() => {
  initShell({ onVaultRestored: refreshCockpit });
  initCockpit();
});
