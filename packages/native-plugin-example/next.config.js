module.exports = 
  {
    trailingSlash: true,
    future: {
      excludeDefaultMomentLocales: true,
      webpack5: true
    },
    dir: './',
    distDir: './.next',
    webpack(config) {
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
      return config
    }
  }
