import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  base: "/promt-child/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/three/")) {
            return id.includes("/build/three.core.js")
              ? "three-core"
              : "three-renderer";
          }
        },
      },
    },
  },
});
