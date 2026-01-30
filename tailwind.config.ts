import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0a0a0f",
        accent: "#D86DCB",
        "accent-glow": "#f5a7e6"
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0, 0, 0, 0.35)",
        glow: "0 0 30px rgba(216, 109, 203, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
