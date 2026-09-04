import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14161A",
        paper: "#FAFAF9",
        line: "#E6E4DE",
        muted: "#6B7078",
        accent: {
          DEFAULT: "#4338CA", // indigo — ties to QR color options, still used by organizer/admin
          soft: "#EEECFB",
        },
        brand: {
          DEFAULT: "#FF007F", // landing page accent — used sparingly for CTAs/links/selected states
          dark: "#D6006B",
          soft: "#FFE6F2",
        },
        good: "#15803D",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,26,0.04), 0 1px 1px rgba(20,22,26,0.03)",
      },
      letterSpacing: {
        tight2: "-0.02em",
      },
    },
  },
  plugins: [],
};
export default config;