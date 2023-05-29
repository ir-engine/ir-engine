module.exports = {
  failZero: false,
  parallel: false,
  spec: ['**/*.test.ts', '**/*.test.tsx'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/esm'
  ],
  extension: [
    'ts',
    'tsx'
  ],
  bail: true,
  exit: true,
  recursive: true,
  jobs: '1',
  timeout: '20000'
};