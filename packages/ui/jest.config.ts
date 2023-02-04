/** @type {import('ts-jest').JestConfigWithTsJest} */

import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
    '^.+\\.scss$': 'jest-scss-transform'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['node_modules', 'jest-test-results.json'],
  setupFilesAfterEnv: ['<rootDir>src/setupTests.ts'],
  snapshotSerializers: ['enzyme-to-json/serializer']
}

export default config
