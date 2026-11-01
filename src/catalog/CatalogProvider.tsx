import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabaseConfigured } from "../lib/supabase";
import { explainError, getCategories, getPrompts, withCovers } from "./api";
import type { CatalogPrompt, PromptCategory } from "./types";
interface CatalogState {
  prompts: CatalogPrompt[];
  categories: PromptCategory[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}
const CatalogContext = createContext<CatalogState | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<CatalogPrompt[]>([]),
    [categories, setCategories] = useState<PromptCategory[]>([]),
    [loading, setLoading] = useState(supabaseConfigured),
    [error, setError] = useState("");
  const request = useRef(0);
  const refresh = useCallback(async () => {
    if (!supabaseConfigured) return;
    const n = ++request.current;
    try {
      const [data, cats] = await Promise.all([
        getPrompts(true),
        getCategories(),
      ]);
      const enriched = await withCovers(data);
      if (n === request.current) {
        setPrompts(enriched);
        setCategories(cats);
        setError("");
      }
    } catch (e) {
      if (n === request.current) setError(explainError(e));
    } finally {
      if (n === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const onFocus = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(onFocus, 30000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      ++request.current;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);
  return (
    <CatalogContext.Provider
      value={{ prompts, categories, loading, error, refresh }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("CatalogProvider is required");
  return context;
}
