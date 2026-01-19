/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d1b1e",
        linen: "#f8f6f2",
        fog: "#eef1f1",
        ember: "#e07a5f",
        moss: "#3d5a3f",
      },
      boxShadow: {
        soft: "0 12px 30px -20px rgba(13, 27, 30, 0.35)",
      },
    },
  },
  plugins: [],
};
