/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: "class",
  important: true, // important in prod is must be
  theme: ["dark"],
  daisyui: {
    themes: ['default', 'dark', 'luxury', 'cupcake'],
    // daisyUI config (optional)
    styled: true,
    base: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    require('@tailwindcss/aspect-ratio'),
  ],
}
