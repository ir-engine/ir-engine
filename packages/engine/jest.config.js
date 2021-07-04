module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  setupTestFrameworkScriptFile: 'expect-puppeteer',
  moduleDirectories: ["node_modules", "bower_components", "src"],
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.(t|j)s(x)?',
  ],
}