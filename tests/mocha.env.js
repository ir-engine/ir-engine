// process.env.APP_ENV = 'test'
const dotenv = require("dotenv")
dotenv.config({
  path: './.env.local'
})

process.env.TS_NODE_FILES = true
process.env.TS_NODE_PROJECT = 'tsconfig.json'
process.env.TS_NODE_COMPILER_OPTIONS = '{\"module\": \"commonjs\" }'
