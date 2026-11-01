import { useState, useEffect } from "react";
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`aip.${key}`);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(`aip.${key}`, JSON.stringify(value));
    } catch {
      /* Private browsing or storage quota: keep the session usable. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
