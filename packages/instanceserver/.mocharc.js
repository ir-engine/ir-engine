module.exports = {
  failZero: false,
  parallel: false,
  spec: ['tests/**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/esm'
  ],
  extension: [
    'ts'
  ]
};