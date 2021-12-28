module.exports = {
  'fail-zero': true,
  parallel: false,
  spec: ['**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register',
    'mocha-suppress-logs'
  ],
  extension: [
    'ts'
  ],
  exit: true,
  recursive: true,
  jobs: '1',
  timeout: '20000'
};