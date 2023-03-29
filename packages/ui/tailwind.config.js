/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: "class",
  important: true, // important in prod is must be
  theme: ["dark"],
  variants: {
    extend: {
      display: ['hover', 'focus', 'group-hover'],
      opacity: ['hover', 'focus', 'group-hover'],
    }
  },
  daisyui: {
    themes: ['default', 'dark', 'luxury', 'cupcake'],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-3d'),
  ],
}
