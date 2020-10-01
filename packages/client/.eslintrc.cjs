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
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module",
    project: [
      './tsconfig.json',
    ]
  },
  plugins: [
    "react",
    "@typescript-eslint"
  ],
  rules: {
    "no-unused-expressions": "off",
    "no-var": "error",
    "prefer-arrow-callback": "error",
    "semi": "warn",
    "space-before-function-paren": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "off"
    ],
    "@typescript-eslint/no-use-before-define": [
      "off"
    ],
    "@typescript-eslint/default-param-last": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/promise-function-async": "off",
    // React linting rules
    "react/boolean-prop-naming": ["error", { "rule": "^(is|has)[A-Z]([A-Za-z0-9]?)+" }],
    "react/button-has-type": "error",
    "react/default-props-match-prop-types": "error",
    "react/no-danger": "error",
    "react/no-unused-state": "error",
    "react/no-will-update-set-state": "error",
    "react/prefer-stateless-function": "error",
    "react/react-in-jsx-scope": "off",
    "react/no-redundant-should-component-update": "error",
    "react/no-string-refs": ["error", { "noTemplateLiterals": true }],
    "react/no-this-in-sfc": "error",
    "react/no-typos": "error",
    "react/no-empty-function": "off",
    "react/no-unsafe": ["error", { "checkAliases": true }],
    "react/self-closing-comp": "error",
    "react/sort-comp": "error",
    "react/void-dom-elements-no-children": "error",
    "react/style-prop-object": "error",
    "react/static-property-placement": ["error", "static public field"],
    "react/state-in-constructor": "error",
    "react/no-access-state-in-setstate": "error",
    "react/no-adjacent-inline-elements": "error"
  },
  overrides: [
    {
      "files": ["enums/*.tsx", "enums/*.ts"],
      "rules": {
        "no-unused-vars": ["off"]
      }
    }
  ],
  "settings": {
    "react": {
      "createClass": "createReactClass",
      "pragma": "React",
      "version": "detect",
    },
    "propWrapperFunctions": [
      "forbidExtraProps",
      { "property": "freeze", "object": "Object" },
      { "property": "myFavoriteWrapper" }
    ],
    "linkComponents": [
      "Hyperlink",
      { "name": "Link", "linkAttribute": "to" }
    ]
  }
}