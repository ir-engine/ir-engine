module.exports = {
  root: true,
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}