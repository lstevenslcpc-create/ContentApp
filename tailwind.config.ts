import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#f7f9fc",
        brand: "#2563eb",
        coral: "#f97316",
        mint: "#14b8a6"
      },
      boxShadow: {
        premium: "0 18px 60px rgba(17, 24, 39, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
