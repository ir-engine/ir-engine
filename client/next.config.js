const config = require('config')
const withSass = require('@zeit/next-sass')
const withImages = require('next-images')
const path = require('path')

module.exports = withImages(
  withSass({
    /* config options here */
    publicRuntimeConfig: config.publicRuntimeConfig,
    env: {
      API_SERVER: process.env.API_SERVER
    },
    webpack(config, options) {
      config.resolve.alias.utils = path.join(__dirname, 'utils')
      config.module.rules.push({
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: '[name].[ext]'
          }
        }
      })
      return config
    }
  })
)
