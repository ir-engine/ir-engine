module.exports = {
  preset: 'ts-jest/presets/default-esm',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json'],
  testEnvironment: 'node',
  moduleDirectories: ["node_modules", "src"],
  transform: {
    '^.+\\.(ts|tsx)?$': "ts-jest",
    "^.+\\.(js|jsx)$": "ts-jest",
  },
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: [
      './tests/setup.js'
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
      isolatedModules: true,
      tsconfig: 'tsconfig.json',
      useESM: true,
    },
  },
  passWithNoTests: true,
  testMatch: ['<rootDir>/tests/**/*.test.(t|j)s(x)?']
};