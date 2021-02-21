const path = require('path')

module.exports = 
  {
    mode: 'development',
    cache: {
      type: 'filesystem'
      },
    env: {
      APP_URL: process.env.APP_URL,
      SERVER_URL: process.env.SERVER_URL
    },
    watchOptions: {
      ignored: /node_modules/
    },
    trailingSlash: true,
    future: {
      excludeDefaultMomentLocales: true,
      webpack5: true
    },
    optimization: {
      usedExports: true,
     splitChunks: {
       chunks: 'all',
      },
      removeAvailableModules: true,
     runtimeChunk: 'multiple'
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
      config.externals.push({ xmlhttprequest: 'xmlhttprequest', fs: 'fs' })
      config.resolve.alias.utils = path.join(__dirname, 'utils')
      config.module.rules.push(
        {
          test: /\.(eot|woff|woff2|ttf)$/,
          use: ['cache-loader', {
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
          use: ['cache-loader',  {
            loader: "file-loader",
            options: {
              name: "[name]-[hash].[ext]",
              outputPath: "editor/assets/templates"
            }
          }]
        },
        {
          test: /\.ts(x?)$/,
          use: ['cache-loader',
            {
              loader: 'babel-loader',
              options: { "presets": ["next/babel"] }
            }, {
              loader: 'ts-loader',
              options: {
                allowTsInNodeModules: true,
                transpileOnly: true,
                // happyPackMode: true
              },
            }]
        },
        {
          test: /\.m?js$/,
          use: ['cache-loader',  {
            loader: 'babel-loader',
            options: {
              presets: [
                'next/babel'
              ]
            }
          }]
        })

      config.module.rules.push({
        test: /\.(glb)(\?.*$|$)/,
        use: ['cache-loader',  {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "editor/assets/models"
          }
        }]
      })
      config.module.rules.push({
        test: /\.(gltf)(\?.*$|$)/,
        use: ['cache-loader',  {
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
          'cache-loader', 
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
        use: ['cache-loader',  'ts-shader-loader']
      })
      config.module.rules.push({
        test: /\.(mp4|webm)(\?.*$|$)/,
        use: ['cache-loader',  {
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
        use: ['cache-loader',  {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]"
          }
        }]
      })
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'javascript/auto',
        use: ['cache-loader',  {
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
  }
