const config = require('config')
const withSass = require('@zeit/next-sass')
const withImages = require('next-images')
const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = withImages(
  withSass({
    /* config options here */
    publicRuntimeConfig: config.get('publicRuntimeConfig'),
    env: {
      API_SERVER: process.env.API_SERVER
    },
    dir: './client',
    distDir: './.next',
    webpack(config, options) {
      config.resolve.alias.utils = path.join(__dirname, 'utils')
      config.optimization.minimize = process.env.NODE_ENV === 'production'
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
      config.module.rules.push({
          test: /\.ts$/,
          use: 'ts-loader',
          include: /shared/
      })
        config.plugins.push(new CircularDependencyPlugin({
            exclude: /a\.js|node_modules/,
            // add errors to webpack instead of warnings
            failOnError: true,
            // allow import cycles that include an asyncronous import,
            // e.g. via import(/* webpackMode: "weak" */ './file.js')
            allowAsyncCycles: false,
            // set the current working directory for displaying module paths
            cwd: process.cwd()
        }))
      return config
    }
  })
)
