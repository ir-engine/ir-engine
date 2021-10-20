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
    "react-hooks",
    "@typescript-eslint"
  ],
  rules: {
    "no-unused-expressions": "off",
    "no-var": "off",
    "prefer-const": "off",
    "prefer-arrow-callback": "error",
    "space-before-function-paren": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/default-param-last": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/promise-function-async": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": [
       "off",
      {
        "types": [
            "{}",
            "object"
        ]
      }
    ],
    // React linting rules
    "react/boolean-prop-naming": "off",
    "react/button-has-type": "error",
    "react/no-danger": "error",
    "react/no-unused-state": "error",
    "react/no-will-update-set-state": "error",
    "react/prefer-stateless-function": "warn",
    "react/react-in-jsx-scope": "off",
    "react/no-redundant-should-component-update": "error",
    "react/no-string-refs": ["error", { "noTemplateLiterals": true }],
    "react/no-this-in-sfc": "error",
    "react/no-typos": "error",
    "react/no-empty-function": "off",
    "react/no-unsafe": ["warn", { "checkAliases": true }],
    "react/self-closing-comp": "error",
    "react/sort-comp": "error",
    "react/void-dom-elements-no-children": "error",
    "react/style-prop-object": "error",
    "react/static-property-placement": ["error", "static public field"],
    "react/state-in-constructor": "warn",
    "react/no-access-state-in-setstate": "warn",
    "react/no-adjacent-inline-elements": "error",
    "react-hooks/exhaustive-deps": "warn"
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