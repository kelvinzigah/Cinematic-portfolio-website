import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap")) return "gsap";
          if (id.includes("node_modules/framer-motion")) return "framer-motion";
          if (id.includes("node_modules/react") || id.includes("node_modules/react-router")) return "react-vendor";
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
  },
});
