/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3f2ee", // page background
        ink: "#161a17", // text
        forest: "#1f3a2b", // accent: buttons, active states
        moss: "#4f6f43",
        clay: "#b4694a", // focus ring, warnings
        // kept for older class names
        cream: "#f3f2ee",
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans Telugu"', '"Noto Sans Devanagari"', "system-ui", "sans-serif"],
        display: ['"Cormorant Garamond"', '"Noto Sans Telugu"', '"Noto Sans Devanagari"', "Georgia", "serif"],
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        hand: ['"Caveat"', '"Segoe Script"', "cursive"],
      },
    },
  },
  plugins: [],
};
