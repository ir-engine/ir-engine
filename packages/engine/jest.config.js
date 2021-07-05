module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer', "./tests/custom-env.js"],
  moduleDirectories: ["node_modules", "src"],
  setupFiles: [],
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.(t|j)s(x)?',
  ],
}