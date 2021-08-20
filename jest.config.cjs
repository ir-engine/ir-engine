
/**
 * @todo our unit tests currently fail, they have not been updated in a very long time
 */


/**
* @info Intergration tests are tests that require more than one package in this repo.
* ie. the client, api server and game server working together
*/

module.exports = {
  displayName: "Integration Tests",
  preset: "jest-puppeteer",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer', "./tests/custom-env.js"],
  moduleDirectories: ["node_modules", "src"],
  setupFiles: [],
  maxWorkers: 1,
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.(t|j)s(x)?',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
}