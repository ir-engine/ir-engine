module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier"
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
    "prefer-rest-params": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-functions": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "no-var": "error",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": "off",
    "space-before-function-paren":"off",
    "@typescript-eslint/default-param-last": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/promise-function-async": "off",
    "prefer-arrow-callback": "error",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/class-name-casing:": "off",
    "@typescript-eslint/no-this-alias": "off"
  }
}
