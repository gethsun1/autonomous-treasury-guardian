import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "midnight-indigo": "#0B1226",
        "electric-teal": "#00E0C7",
        "photon-cyan": "#4EE1FF",
        "solar-gold": "#FFC857",
        "frost-white": "#F6F9FC",
        "glass-gray": "#192234",
        "success-green": "#2EE6A5",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(0, 255, 240, 0.25)",
        soft: "0 0 12px rgba(0, 255, 230, 0.15)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
