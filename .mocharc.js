module.exports = {
  'allow-uncaught': false,
  'fail-zero': false,
  parallel: false,
  timeout: 3 * 60 * 1000,
  spec: ['tests/**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register',
    'tests/setup'
  ],
  extension: [
    'ts'
  ]
};