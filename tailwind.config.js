/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#6B4EFF",
        ink: "#111827",
        soft: "#F5F7FB",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 6px 30px rgba(0,0,0,0.06)",
      },
      transitionDuration: {
        200: "200ms"
      }
    },
  },
  plugins: [],
}
