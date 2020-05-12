module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: [
      './tsconfig.json',
      './tsconfig.eslint.json'
    ]
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'standard-with-typescript'
  ],
  // These are Standard.js overrides, for rules that don't play well with
  // Feathers.js auto-generated code
  rules: {
    '@typescript-eslint/default-param-last': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    "space-before-function-paren": "off",
    "no-var": "error",
    "semi": "error"
  }
}
