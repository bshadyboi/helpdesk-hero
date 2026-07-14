import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// On GitHub Pages the site is served from /helpdesk-hero/.
// Locally (dev/preview) we serve from root.
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Helpdesk Hero",
        short_name: "Helpdesk",
        description: "IT help desk simulator — handle tickets, earn XP, climb the ranks.",
        theme_color: "#070b16",
        background_color: "#070b16",
        display: "standalone",
        start_url: command === "build" ? "/helpdesk-hero/" : "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,woff,woff2}"],
      },
    }),
  ],
  base: command === "build" ? "/helpdesk-hero/" : "/",
  server: {
    port: 5219,
    strictPort: true,
    open: false,
  },
}));
