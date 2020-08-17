const path = require('path')
const appRootPath = require('app-root-path')
process.env.NODE_CONFIG_DIR = path.join(appRootPath.path, 'packages/client/config')
const config = require('config')
const withSass = require('@zeit/next-sass')
const withImages = require('next-images')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const glsl = {
  include: ["**/*.frag", "**/*.vert"],
  sourceMap: false
}

const string = {
  include: ["**/*.tmp"]
}

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
      config.module.rules.push({
        test: /\.tmp$/i,
        use: 'raw-loader',
      })
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
        use: {
          loader: 'ts-loader',
          options: { allowTsInNodeModules: true },
        }
      })
      config.module.rules.push({
        test: /\.(png|jpg|jpeg|gif|svg)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/images"
          }
        }
      })

      config.module.rules.push({
        test: /\.(glb)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/models"
          }
        }
      })
      config.module.rules.push({
        test: /\.(gltf)(\?.*$|$)/,
        use: {
          loader: "gltf-webpack-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/models"
          }
        }
      })
      config.module.rules.push({
        test: /\.(bin)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]-[hash].[ext]",
              outputPath: "editor/assets/models"
            }
          }
        ]
      })
      config.module.rules.push({
        test: /\.(glsl|vert|fs|frag)$/,
        loader: 'ts-shader-loader'
    })
      config.module.rules.push({
        test: /\.(mp4|webm)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/videos"
          }
        }
      })
      config.module.rules.push({
        test: /\.(world)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/templates"
          }
        }
      })
      config.module.rules.push({
        test: /\.worker\.js$/,
        include: path.join(__dirname, "src"),
        loader: "worker-loader",
        options: {
          // Workers must be inlined because they are hosted on a CDN and CORS doesn't permit us
          // from loading worker scripts from another origin. To minimize bundle size, dynamically
          // import a wrapper around the worker. See SketchfabZipLoader.js and API.js for an example.
          name: "editor/assets/js/workers/[name]-[hash].js",
          inline: true,
          fallback: false
        }
      })
      config.module.rules.push({
        test: /\.wasm$/,
        type: "javascript/auto",
        use: {
          loader: "file-loader",
          options: {
            outputPath: "editor/assets/js/wasm",
            name: "[name]-[hash].[ext]"
          }
        }
      })
      config.plugins.push(new CircularDependencyPlugin({
        exclude: /a\.js|node_modules/,
        // add errors to webpack instead of warnings
        failOnError: false,
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
