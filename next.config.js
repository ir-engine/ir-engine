const config = require('config')
const withSass = require('@zeit/next-sass')
const withImages = require('next-images')

module.exports = withImages(
  withSass({
    /* config options here */
    publicRuntimeConfig: config.publicRuntimeConfig,
    auth: config.auth,
    webpack(config, options) {
      return config
    }
  })
)
