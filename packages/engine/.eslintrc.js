module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    project: [
      './tsconfig.json',
    ]
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    "no-unused-expressions":"off",
    "no-unused-vars": "off",
    "no-var": "error",
    "semi": "off",
    "space-before-function-paren":"off",
    "@typescript-eslint/no-unused-vars": [
      "error"
    ],
    "@typescript-eslint/default-param-last": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/promise-function-async": "off",
      "space-before-function-paren": "off",
      "no-var": "error",
      "prefer-arrow-callback": "error",
  }
}
