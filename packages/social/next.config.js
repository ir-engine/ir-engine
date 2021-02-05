const path = require('path')
const appRootPath = require('app-root-path')
process.env.NODE_CONFIG_DIR = path.join(appRootPath.path, 'packages/client/config')
const conf = require('config');
const withImages = require('next-images')

module.exports = withImages(
  {
    /* config options here */
    publicRuntimeConfig: conf.get('publicRuntimeConfig'),
    env: {
      APP_URL: process.env.APP_URL,
      SERVER_URL: process.env.SERVER_URL
    },
    dir: './',
    distDir: './.next',
    async redirects() {
      return [
        {
          source: '/s/:slug*',
          destination: '/scene/:slug*',
          permanent: true
        },
        {
          source: '/s/id/:slug*',
          destination: '/scene/id/:slug*',
          permanent: true
        },
        {
          source: '/t/:slug*',
          destination: '/test/:slug*',
          permanent: true
        },
        {
          source: '/c/:slug*',
          destination: '/create/:slug*',
          permanent: true
        },
        {
          source: '/home',
          destination: '/',
          permanent: true
        }
      ]
    },
    webpack(config) {
      config.externals.push({xmlhttprequest: 'xmlhttprequest', fs: 'fs'})
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
          test: /\.svg$/,
          use: [
            {
              loader: 'url-loader',
            },
          ],
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
          test: /\.(ts|tsx)$/,
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
        type: 'javascript/auto',
        use: ['cache-loader', 'thread-loader', {
            loader: 'file-loader',
            options: {
              outputPath: 'editor/assets/js/wasm',
              name: '[name]-[hash].[ext]'
            }
          },
        ]
      })
      return config
    }
  })
