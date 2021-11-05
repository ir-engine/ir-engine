module.exports = {
  'fail-zero': false,
  parallel: true,
  spec: ['**/*.test.ts'],
  require: [
    'tests/mocha.env', // init env here : DRC
    'ts-node/register'
  ],
  extension: [
    'ts'
  ]
};