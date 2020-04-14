const config = require('config')
const withSass = require('@zeit/next-sass')
module.exports = withSass({
  /* config options here */
  publicRuntimeConfig: config.publicRuntimeConfig,
  auth: config.auth
})
