const config = require('config')
const withSass = require('@zeit/next-sass')
const withImages = require('next-images')
const path = require('path')

module.exports = withImages(
  withSass({
    /* config options here */
    publicRuntimeConfig: config.publicRuntimeConfig,
    webpack(config, options) {
      config.resolve.alias.utils = path.join(__dirname, 'utils')
      return config
    }
  })
)
