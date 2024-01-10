module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  ignorePatterns: ['packages/server/upload', 'packages/server/upload_test', '**/*.js', 'packages/projects/projects/**'],
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prefer-const': 'warn',
    'no-async-promise-executor': 'off',
    'no-useless-escape': 'off',
    '@typescript-eslint/no-extra-semi': 'off', // 'error' this currently conflicts with prettier,
    '@typescript-eslint/no-unused-vars': 'off',
    "no-fallthrough": "off",
  },
  env: {
    browser: true,
    node: true
  }
}
