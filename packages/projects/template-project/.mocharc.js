module.exports = {
  failZero: false,
  parallel: false,
  spec: ['tests/**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register'
  ],
  extension: [
    'ts'
  ],
  bail: true,
  exit: true,
  recursive: true,
  jobs: '1',
  timeout: '20000'
};