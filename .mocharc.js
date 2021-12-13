module.exports = {
  'fail-zero': false,
  parallel: true,
  spec: ['tests/**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register',
    'mocha-suppress-logs'
  ],
  extension: [
    'ts'
  ]
};