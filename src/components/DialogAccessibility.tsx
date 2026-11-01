import { useEffect } from "react";

/** Shared focus management for dialogs owned by individual project modules. */
export function DialogAccessibility() {
  useEffect(() => {
    let current: HTMLElement | null = null;
    let returnFocus: HTMLElement | null = null;
    let originalOverflow = "";
    const focusable = (dialog: HTMLElement) =>
      [
        ...dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ),
      ].filter((e) => e.getClientRects().length > 0);
    const sync = () => {
      const next = document.querySelector<HTMLElement>('[role="dialog"]');
      if (next === current) return;
      if (next) {
        if (!current) {
          returnFocus = document.activeElement as HTMLElement;
          originalOverflow = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        }
        current = next;
        if (!next.contains(document.activeElement)) focusable(next)[0]?.focus();
      } else {
        current = null;
        document.body.style.overflow = originalOverflow;
        if (returnFocus?.isConnected) returnFocus.focus();
        returnFocus = null;
      }
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    const onKey = (event: KeyboardEvent) => {
      if (!current) return;
      if (event.key === "Escape") {
        event.preventDefault();
        current.querySelector<HTMLButtonElement>(".close")?.click();
        return;
      }
      if (event.key !== "Tab") return;
      const all = focusable(current),
        first = all[0],
        last = all.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !current.contains(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", onKey);
      if (current) document.body.style.overflow = originalOverflow;
    };
  }, []);
  return null;
}
