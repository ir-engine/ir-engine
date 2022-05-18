module.exports = {
  failZero: false,
  parallel: true,
  spec: ['tests/**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register'
  ],
  extension: [
    'ts'
  ],
  exit: true,
  recursive: true,
  jobs: '1',
  timeout: '300000'
};