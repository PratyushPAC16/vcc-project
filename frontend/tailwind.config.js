/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#f8f6f1",
          100: "#efe9dd",
          900: "#1d2433",
        },
        brand: {
          50: "#e6fbf6",
          400: "#28b197",
          600: "#0f8c77",
          700: "#0e6f5f",
        },
        accent: {
          300: "#f7ce89",
          500: "#d88918",
        },
      },
      boxShadow: {
        glow: "0 20px 60px rgba(18, 36, 32, 0.15)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.45s ease-out",
      },
    },
  },
  plugins: [],
};
