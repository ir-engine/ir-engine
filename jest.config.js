export default {
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testEnvironment: 'jest-environment-node',
    transform: {
      // "^.+\\.jsx?$": "babel-jest",
      ".(ts|tsx)": "<rootDir>/node_modules/ts-jest/preprocessor.js"
    },
    testMatch: ['<rootDir>/test/**/*.ts'],
    // snapshotSerializers: ["three-snapshot-serializer"],
  };