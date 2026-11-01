import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();
function isPublicKey(value: string) {
  if (value.startsWith("sb_secret_")) return false;
  if (value.startsWith("eyJ")) {
    try {
      const part = value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(part)).role === "anon";
    } catch {
      return false;
    }
  }
  return value.startsWith("sb_publishable_");
}
export const supabaseConfigured = Boolean(
  url &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) &&
  key &&
  isPublicKey(key),
);
// These two values are intentionally public. Authorization is enforced by RLS,
// never by a hidden frontend password or a service-role key.
export const supabase = supabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
export const COVER_BUCKET = "deepseek-covers";
