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
  ]
};