const appRootPath = require('app-root-path')
const dotenv = require('dotenv')
dotenv.config({
  path: appRootPath.path + '/.env.local'
})
const args = process.argv.slice(2)

// first arg is the env variable name, second arg is the value to compare

const val = process.env[args[0]] === args[1] ? 'true' : 'false'

// log the value to the console
console.log(val)
