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
    dir: './',
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
      config.module.rules.push(
      {
        test: /\.(png|jpg|jpeg|gif|svg)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/images"
          }
        }
      })
      config.module.rules.push(
      {
        test: /\.(woff|woff2|ttf|eot)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/fonts"
          }
        }
      })
      config.module.rules.push({
        test: /\.(glb)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/models"
          }
        }
      }),
      config.module.rules.push({
        test: /\.(gltf)(\?.*$|$)/,
        use: {
          loader: "gltf-webpack-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/models"
          }
        }
      }),
      config.module.rules.push({
        test: /\.(bin)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]-[hash].[ext]",
              outputPath: "components/editor/assets/models"
            }
          }
        ]
      }),
      config.module.rules.push({
        test: /\.(mp4|webm)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/videos"
          }
        }
      }),
      config.module.rules.push({
        test: /\.(world)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/templates"
          }
        }
      }),
      config.module.rules.push({
        test: /\.js$/,
        include: path.join(__dirname, "src"),
        use: "babel-loader"
      }),
      config.module.rules.push({
        test: /\.worker\.js$/,
        include: path.join(__dirname, "src"),
        loader: "worker-loader",
        options: {
          // Workers must be inlined because they are hosted on a CDN and CORS doesn't permit us
          // from loading worker scripts from another origin. To minimize bundle size, dynamically
          // import a wrapper around the worker. See SketchfabZipLoader.js and API.js for an example.
          name: "components/editor/assets/js/workers/[name]-[hash].js",
          inline: true,
          fallback: false
        }
      }),
      config.module.rules.push({
        test: /\.wasm$/,
        type: "javascript/auto",
        use: {
          loader: "file-loader",
          options: {
            outputPath: "components/editor/assets/js/wasm",
            name: "[name]-[hash].[ext]"
          }
        }
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
      })
      )
      return config
    }
  })
)