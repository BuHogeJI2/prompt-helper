/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d1b1e",
        cinder: "#1a1715",
        linen: "#f8f6f2",
        fog: "#eef1f1",
        ember: "#e07a5f",
        moss: "#3d5a3f",
        sand: "#efe4d4",
      },
      backgroundImage: {
        page: "radial-gradient(circle at top left, rgba(255,255,255,0.96), rgba(248,240,228,0.92) 38%, rgba(240,232,220,0.88) 100%)",
      },
      boxShadow: {
        soft: "0 12px 30px -20px rgba(13, 27, 30, 0.35)",
        panel: "0 30px 80px -48px rgba(26, 23, 21, 0.45)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 220ms ease-out",
        "accordion-up": "accordion-up 200ms ease-in",
      },
    },
  },
  plugins: [],
};
