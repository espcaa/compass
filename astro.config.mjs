// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Rail",
      cssVariable: "--font-rail",
      options: {
        variants: [
          {
            weight: "400",
            src: ["./src/assets/fonts/brit_nm.ttf"],
          },
          {
            weight: "700",
            src: ["./src/assets/fonts/brit_bold.ttf"],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Dot",
      cssVariable: "--font-dot",
      options: {
        variants: [
          {
            weight: "400",
            src: ["./src/assets/fonts/dot.woff"],
          },
        ],
      },
    },
  ],

  integrations: [react()],

  adapter: node({
    mode: "standalone",
  }),
  output: "server",
  security: {
    checkOrigin: false,
  },
});
