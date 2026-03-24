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
          bg: "#0d1117",
          surface: "#161b22",
          border: "#30363d",
          text: "#c9d1d9",
          muted: "#8b949e",
          green: "#3fb950",
          blue: "#58a6ff",
          yellow: "#d29922",
          red: "#f85149",
          cursor: "#58a6ff",
        },
      },
      fontFamily: {
        mono: ["D2Coding", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
