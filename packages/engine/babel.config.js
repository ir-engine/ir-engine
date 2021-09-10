module.exports = {
  presets: [
    ['@babel/preset-env', { "targets": { "node": "current" } }],
    '@babel/preset-typescript',
    "babel-preset-vite"
  ],
  plugins: [
    ["@babel/transform-runtime"],
    ["babel-plugin-transform-import-meta"],
    ["dynamic-import-node"]
  ]
}
