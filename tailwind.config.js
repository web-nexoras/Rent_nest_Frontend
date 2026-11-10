/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (prefix) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [n, v(`${prefix}-${n}`)])
  );

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        serif: ["Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        heading: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      colors: {
        // Theme-aware neutral scale (flips automatically in dark mode)
        navy: scale("navy"),
        surface: {
          DEFAULT: v("surface"),
          muted: v("surface-muted"),
          subtle: v("surface-subtle"),
        },
        gold: {
          50: "#FBF7EA",
          100: "#F6ECC9",
          200: "#EDD796",
          300: "#E2BE5C",
          400: "#D4AF37",
          500: "#C59B27",
          600: "#A37C1A",
          700: "#826013",
          800: "#634811",
          900: "#49340E",
        },
        brand: {
          50: "#FBF7EA",
          100: "#F6ECC9",
          200: "#EDD796",
          300: "#E2BE5C",
          400: "#D4AF37",
          500: "#C59B27",
          600: "#9A7418",
          700: "#7A590E",
          800: "#5C430B",
          900: "#3F2E08",
          950: "#241A04",
        },
      },
      boxShadow: {
        "2xs": "0 1px 1px 0 rgba(20, 20, 19, 0.04)",
        xs: "0 1px 2px 0 rgba(20, 20, 19, 0.06)",
        soft: "0 2px 10px -2px rgba(20, 20, 19, 0.05), 0 4px 16px -4px rgba(197, 155, 39, 0.06)",
        card: "0 10px 30px -5px rgba(20, 20, 19, 0.08), 0 4px 12px -2px rgba(20, 20, 19, 0.04)",
        pop: "0 20px 45px -12px rgba(20, 20, 19, 0.25)",
        glow: "0 12px 32px -8px rgba(197, 155, 39, 0.35)",
        obsidian: "0 20px 45px -12px rgba(0, 0, 0, 0.45)",
      },
      backdropBlur: { xs: "2px" },
      spacing: { 4.5: "1.125rem", 13: "3.25rem", 15: "3.75rem" },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-in": "fade-in 0.35s ease-out both" },
    },
  },
  plugins: [],
};
