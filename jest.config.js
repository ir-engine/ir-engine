module.exports = {
    runner: 'jest-runner-tsc',
    displayName: 'tsc',
    moduleFileExtensions: ['js','ts', 'tsx'],
    testMatch: ['<rootDir>/src/**/*.ts'],
    snapshotSerializers: ["three-snapshot-serializer"],
  };