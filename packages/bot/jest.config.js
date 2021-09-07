module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  setupTestFrameworkScriptFile: 'expect-puppeteer',
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  passWithNoTests: true,
  testMatch: ['<rootDir>/tests/**/*.test.(t|j)s(x)?'],
}