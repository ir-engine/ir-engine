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
      config.module.rules.push([{
        test: /\.ts$/,
        use: 'ts-loader',
        include: /shared/
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/images"
          }
        }
      },
      {
        test: /\.(woff|woff2|ttf|eot)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/fonts"
          }
        }
      },
      {
        test: /\.(glb)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/models"
          }
        }
      },
      {
        test: /\.(gltf)(\?.*$|$)/,
        use: {
          loader: "gltf-webpack-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/models"
          }
        }
      },
      {
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
      },
      {
        test: /\.(mp4|webm)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/videos"
          }
        }
      },
      {
        test: /\.(spoke)(\?.*$|$)/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[hash].[ext]",
            outputPath: "components/editor/assets/templates"
          }
        }
      },
      {
        test: /\.js$/,
        include: path.join(__dirname, "src"),
        use: "babel-loader"
      },
      {
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
      },
      {
        test: /\.wasm$/,
        type: "javascript/auto",
        use: {
          loader: "file-loader",
          options: {
            outputPath: "components/editor/assets/js/wasm",
            name: "[name]-[hash].[ext]"
          }
        }
      }
      ])
      config.plugins.push([new CircularDependencyPlugin({
        exclude: /a\.js|node_modules/,
        // add errors to webpack instead of warnings
        failOnError: true,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd()
      }),
      new webpack.EnvironmentPlugin({
        BUILD_VERSION: "dev",
        NODE_ENV: "development",
        API_SERVER_ADDRESS: undefined,
        API_ASSETS_ROUTE: "",
        API_ASSETS_ACTION: "",
        API_MEDIA_ROUTE: "",
        API_MEDIA_SEARCH_ROUTE: "",
        API_META_ROUTE: "",
        API_PROJECTS_ROUTE: "",
        API_PROJECT_PUBLISH_ACTION: "",
        API_RESOLVE_MEDIA_ROUTE: "",
        API_SCENES_ROUTE: "",
        API_SOCKET_ENDPOINT: "",
        THUMBNAIL_SERVER: "",
        THUMBNAIL_ROUTE: "",
        CLIENT_SCENE_ROUTE: "",
        CLIENT_LOCAL_SCENE_ROUTE: "",
        USE_DIRECT_UPLOAD_API: true,
        CLIENT_ADDRESS: undefined,
        CORS_PROXY_SERVER: null,
        BASE_ASSETS_PATH: "",
        NON_CORS_PROXY_DOMAINS: "",
        ROUTER_BASE_PATH: "",
        SENTRY_DSN: null,
        GA_TRACKING_ID: null,
        IS_XR3: true,
        USE_HTTPS: true,
        GITHUB_ORG: "xr3ngine",
        GITHUB_REPO: "xr3ngine",
        GITHUB_PUBLIC_TOKEN: ""
      })
      ]
      )
      return config
    }
  })
)