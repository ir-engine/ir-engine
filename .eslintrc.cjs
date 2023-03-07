module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    // "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "@typescript-eslint/ban-ts-comment": "warn"
  },
  env: {
    "browser": true,
    "node": true
  }
}