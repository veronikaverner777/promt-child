import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_SUPABASE_");
  const key = (
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();
  let unsafe = key.startsWith("sb_secret_");
  if (key.startsWith("eyJ")) {
    try {
      unsafe =
        JSON.parse(
          atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        ).role !== "anon";
    } catch {
      unsafe = true;
    }
  }
  if (unsafe)
    throw new Error(
      "Supabase: use only a public publishable/anon key. Server secrets must never enter a Vite bundle.",
    );
  return {
    base: "/promt-child/",
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("/node_modules/@supabase/")) return "supabase";
            if (id.includes("/node_modules/three/")) {
              return id.includes("/build/three.core.js")
                ? "three-core"
                : "three-renderer";
            }
          },
        },
      },
    },
  };
});
