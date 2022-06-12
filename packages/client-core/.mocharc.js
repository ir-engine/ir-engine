module.exports = {
  failZero: false,
  parallel: true,
  spec: ['**/*.test.*'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register'
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
