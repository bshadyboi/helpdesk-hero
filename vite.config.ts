import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the site is served from /helpdesk-hero/.
// Locally (dev/preview) we serve from root.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/helpdesk-hero/" : "/",
  server: {
    port: 5219,
    strictPort: true,
    open: false,
  },
}));
