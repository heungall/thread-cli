import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg:      "rgb(var(--color-bg) / <alpha-value>)",
          surface: "rgb(var(--color-surface) / <alpha-value>)",
          border:  "rgb(var(--color-border) / <alpha-value>)",
          text:    "rgb(var(--color-text) / <alpha-value>)",
          muted:   "rgb(var(--color-muted) / <alpha-value>)",
          green:   "rgb(var(--color-green) / <alpha-value>)",
          blue:    "rgb(var(--color-blue) / <alpha-value>)",
          yellow:  "rgb(var(--color-yellow) / <alpha-value>)",
          red:     "rgb(var(--color-red) / <alpha-value>)",
          cursor:  "rgb(var(--color-cursor) / <alpha-value>)",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
