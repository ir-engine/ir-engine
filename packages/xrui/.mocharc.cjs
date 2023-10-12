module.exports = {
  failZero: false,
  parallel: true,
  spec: ['**/*.test.ts', '**/*.test.tsx'],
  require: [
    'tests/mocha.env', // init env here
    'jsdom-global/register'
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