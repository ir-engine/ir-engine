process.env.APP_ENV = 'test'
process.env.TS_NODE_FILES = true
process.env.TS_NODE_PROJECT = 'tsconfig.json'
process.env.TS_NODE_COMPILER_OPTIONS = '{\"module\": \"commonjs\" }'

const sass = require('sass')
const hook = require('css-modules-require-hook')

hook({
  extensions: [ '.scss', '.css' ],
  generateScopedName: '[local]___[hash:base64:5]',
  preprocessCss: data => sass.compileString(data).css
})