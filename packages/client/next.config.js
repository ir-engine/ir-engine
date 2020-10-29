const path = require('path')
const appRootPath = require('app-root-path')
process.env.NODE_CONFIG_DIR = path.join(appRootPath.path, 'packages/client/config')
const conf = require('config');
const withImages = require('next-images')

console.log({
  API_SERVER: process.env.API_SERVER,
  API_SERVER_ADDRESS: process.env.API_SERVER_ADDRESS,
  API_RESOLVE_MEDIA_ROUTE: process.env.API_RESOLVE_MEDIA_ROUTE,
  API_PROJECTS_ROUTE: process.env.API_PROJECTS_ROUTE,
  USE_HTTPS: process.env.USE_HTTPS === 'true',
  API_MEDIA_ROUTE: process.env.API_MEDIA_ROUTE
})

module.exports = withImages(
  {
    /* config options here */
    publicRuntimeConfig: conf.get('publicRuntimeConfig'),
    env: {
      API_MEDIA_ROUTE: process.env.API_MEDIA_ROUTE,
      API_MEDIA_SEARCH_ROUTE: process.env.API_MEDIA_SEARCH_ROUTE,
      API_META_ROUTE: process.env.API_META_ROUTE,
      API_PROJECTS_ROUTE: process.env.API_PROJECTS_ROUTE,
      API_RESOLVE_MEDIA_ROUTE: process.env.API_RESOLVE_MEDIA_ROUTE,
      API_SCENES_ROUTE: process.env.API_SCENES_ROUTE,
      API_SERVER_ADDRESS: process.env.API_SERVER_ADDRESS,
      API_SERVER: process.env.API_SERVER,
      API_SOCKET_ENDPOINT: process.env.API_SOCKET_ENDPOINT,
      IS_XR3: process.env.IS_XR3 === 'true',
      USE_DIRECT_UPLOAD_API: process.env.USE_DIRECT_UPLOAD_API === 'true',
      USE_HTTPS: process.env.USE_HTTPS === 'true',
    },
    dir: './',
    distDir: './.next',
    webpack(config) {
      config.resolve.alias.utils = path.join(__dirname, 'utils')
      config.module.rules.push(
        {
          test: /\.m?js$/,
          use: ['cache-loader', 'thread-loader', {
            loader: 'babel-loader',
            options: {
              presets: [
                'next/babel'
              ]
            }
          }]
        },
        {
          test: /\.(eot|woff|woff2|ttf)$/,
          use: ['cache-loader', 'thread-loader', {
            loader: 'url-loader',
            options: {
              limit: 100000,
              name: '[name].[ext]'
            }
          }]
        },
        {
          test: /\.(world)(\?.*$|$)/,
          use: ['cache-loader', 'thread-loader', {
            loader: "file-loader",
            options: {
              name: "[name]-[hash].[ext]",
              outputPath: "editor/assets/templates"
            }
          }]
        },
        {
          test: /\.ts$/,
          use: ['cache-loader', 'thread-loader', {
            loader: 'ts-loader',
            options: {
              allowTsInNodeModules: true,
              transpileOnly: true,
              happyPackMode: true
            },
          }]
        })

      config.module.rules.push({
        test: /\.(glb)(\?.*$|$)/,
        use: ['cache-loader', 'thread-loader', {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/models"
          }
        }]
      })
      config.module.rules.push({
        test: /\.(gltf)(\?.*$|$)/,
        use: ['cache-loader', 'thread-loader', {
          loader: "gltf-webpack-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/models"
          }
        }]
      })
      config.module.rules.push({
        test: /\.(bin)$/,
        use: [
          'cache-loader', 'thread-loader',
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
        use: ['cache-loader', 'thread-loader', 'ts-shader-loader']
      })
      config.module.rules.push({
        test: /\.(mp4|webm)(\?.*$|$)/,
        use: ['cache-loader', 'thread-loader', {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/videos"
          }
        }]
      })
      config.module.rules.push({
        test: /\.worker\.js$/,
        include: path.join(__dirname, "src"),
        use: ['cache-loader', 'thread-loader', {
          loader: "worker-loader",
          options: {
            // Workers must be inlined because they are hosted on a CDN and CORS doesn't permit us
            // from loading worker scripts from another origin. To minimize bundle size, dynamically
            // import a wrapper around the worker. See SketchfabZipLoader.js and API.js for an example.
            name: "editor/assets/js/workers/[name]-[hash].js",
            inline: true,
            fallback: false
          }
        }]
      })
      config.module.rules.push({
        test: /\.tmp$/,
        type: "javascript/auto",
        use: ['cache-loader', 'thread-loader', {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]"
          }
        }]
      })
      config.module.rules.push({
        test: /\.wasm$/,
        type: "javascript/auto",
        use: ['cache-loader', 'thread-loader', {
          loader: "file-loader",
          options: {
            outputPath: "editor/assets/js/wasm",
            name: "[name]-[hash].[ext]"
          }
        }]
      })
      return config
    }
  })
