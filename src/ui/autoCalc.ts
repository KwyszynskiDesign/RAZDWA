/**
 * autoCalc — live update utility.
 *
 * Attaches input / change listeners to every <input>, <select>, <textarea>
 * inside `root` and calls `calc()` whenever the user interacts.
 *
 * Returns a cleanup function (call it in `unmount`).
 */

export interface AutoCalcOptions {
  /** Root element whose inputs should be observed. */
  root: HTMLElement;
  /** The calculation callback — called on every input change. */
  calc: () => void;
  /** Debounce delay in ms (default 120). */
  delay?: number;
}

export function autoCalc({ root, calc, delay = 120 }: AutoCalcOptions): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const run = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        calc();
      } catch (_) {
        /* ignore — view will show "—" until inputs are valid */
      }
    }, delay);
  };

  // Immediate first run
  try { calc(); } catch (_) { /* initial values may be incomplete */ }

  root.addEventListener("input", run, true);   // captures typing in inputs
  root.addEventListener("change", run, true);   // captures selects, checkboxes, radios

  return () => {
    if (timer) clearTimeout(timer);
    root.removeEventListener("input", run, true);
    root.removeEventListener("change", run, true);
  };
}
