/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        card: "#18181B",
        cardBorder: "#27272A",
        surface: "#121215",
        surfaceHover: "#1E1E24",
        primary: {
          DEFAULT: "#22C55E",
          hover: "#16A34A",
          muted: "#14532D",
          glow: "rgba(34, 197, 94, 0.35)",
        },
        text: {
          DEFAULT: "#FFFFFF",
          muted: "#A1A1AA",
          dim: "#71717A",
        },
        accent: {
          blue: "#38BDF8",
          purple: "#A855F7",
          amber: "#F59E0B",
          rose: "#F43F5E",
          cyan: "#06B6D4",
        },
        daw: {
          ruler: "#1F1F24",
          grid: "#16161A",
          trackBg: "#131317",
          clipBg: "#1F2937",
          playhead: "#22C55E",
          record: "#EF4444",
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
