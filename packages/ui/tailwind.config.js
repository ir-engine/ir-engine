/** @type {import('tailwindcss').Config} */
module.exports = {
  mode  : 'jit',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: "class",
  important: true, // important in prod is must be
  theme: ["dark"],
  daisyui: {
    themes: ['default', 'dark', 'luxury', 'cupcake'],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    require('@tailwindcss/aspect-ratio'),
  ],
}
