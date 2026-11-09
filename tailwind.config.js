/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#102A43",
          950: "#0A1B2D",
        },
        brand: {
          50: "#E8F8F4",
          100: "#C5EFE5",
          200: "#8FDFCB",
          300: "#58CFB1",
          400: "#2DBD9C",
          500: "#13A889",
          600: "#0E8A71",
          700: "#0B6C59",
        },
        accent: {
          100: "#FBF0DC",
          300: "#F1D3A0",
          500: "#E9B96E",
          600: "#D49E4C",
        },
        surface: "#F4F7FB",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,42,67,0.04), 0 4px 16px rgba(16,42,67,0.06)",
        pop: "0 12px 40px rgba(16,42,67,0.18)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: 0, transform: "translateX(24px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.22s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
