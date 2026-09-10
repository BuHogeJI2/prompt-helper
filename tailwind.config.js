/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        terminal: [
          '"IBM Plex Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        hover: "rgb(var(--color-hover) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        control: "rgb(var(--color-control) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-ink": "rgb(var(--color-accent-ink) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
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
        "overlay-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "overlay-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "sheet-down": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 220ms ease-out",
        "accordion-up": "accordion-up 200ms ease-in",
        "overlay-in": "overlay-in 180ms ease-out",
        "overlay-out": "overlay-out 150ms ease-in",
        "sheet-up": "sheet-up 240ms ease-out",
        "sheet-down": "sheet-down 180ms ease-in",
      },
    },
  },
  plugins: [],
};
