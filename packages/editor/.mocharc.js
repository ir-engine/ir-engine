module.exports = {
  failZero: false,
  parallel: true,
  spec: ['**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register'
  ],
  extension: [
    'ts'
  ]
};