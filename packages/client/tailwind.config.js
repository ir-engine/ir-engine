/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  content: [
    './src/engine_tw.tsx',
    './src/pages/_app_tw.tsx',
    './src/pages/capture/capture.tsx',
    './src/route/capture.tsx',
    './src/pages/index.html',
    './src/themes/**/*.{tsx,ts,js,jsx}',
  ],
  darkMode: "class",
  important: true, // important in prod is must be
  theme: ["dark"],
  daisyui: {
    themes: ['default', 'dark', 'luxury', 'cupcake'],
  },
  plugins: [],
}
