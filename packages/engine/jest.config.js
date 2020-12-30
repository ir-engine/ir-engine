export default {
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
    //testEnvironment: 'jest-environment-node',
    testEnvironment: './tests/custom-env.cjs',
    transform: {
      // "^.+\\.jsx?$": "babel-jest",
      ".(ts|tsx)": "ts-jest"
    },
    testMatch: [
      '<rootDir>/tests/**/*.test.(t|j)s(x)?',
      //'<rootDir>/src/**/*.(t|j)s(x)?',// check all sources for syntax errors
    ],
    // snapshotSerializers: ["three-snapshot-serializer"],
  }