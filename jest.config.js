export default {
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    //testEnvironment: 'jest-environment-node',
    transform: {
      // "^.+\\.jsx?$": "babel-jest",
      ".(ts|tsx)": "ts-jest"
    },
    testMatch: [
      '<rootDir>/test/**/*.(t|j)s(x)?',
      //'<rootDir>/src/**/*.(t|j)s(x)?',// check all sources for syntax errors
    ],
    // snapshotSerializers: ["three-snapshot-serializer"],
  }