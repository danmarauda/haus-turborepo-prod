import baseConfig from "@v1/ui/tailwind.config";
import type { Config } from "tailwindcss";

const config: Config = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ...baseConfig.theme?.extend?.colors,
        chart: {
          1: "oklch(0.65 0.18 160)",
          2: "oklch(0.75 0.15 85)",
          3: "oklch(0.6 0.15 250)",
          4: "oklch(0.7 0.12 35)",
          5: "oklch(0.55 0.12 300)",
        },
      },
    },
  },
};

export default config;
