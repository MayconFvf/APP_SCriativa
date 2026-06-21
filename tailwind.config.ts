import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#06070d",
        graphite: "#151724",
        paper: "#f7f7fb",
        coral: "#ff7a1a",
        mango: "#ffb000",
        aqua: "#25d9ff",
        mint: "#35f2a2",
        denim: "#3c65ff",
        magenta: "#ff2f9d",
        violet: "#8b5cf6",
        night: "#0b0d16"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(0, 0, 0, 0.35)",
        line: "0 1px 0 rgba(255, 255, 255, 0.08)",
        neon: "0 0 35px rgba(255, 47, 157, 0.22), 0 0 55px rgba(37, 217, 255, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
