const webpack = require('webpack');
const path = require('path');

const aliases = {
  src: 'source',
  dist: 'dist',
  suffix: 'bundle',
  vendor: 'vendor',
};
const basePath = __dirname;
const paths = {
  source: path.resolve(basePath),
  dist: path.resolve(basePath, aliases.dist),
};

module.exports = {
  entry: {
    panel: `${paths.source}/src/app/panel.js`,
  },
  output: {
    filename: `[name].${aliases.suffix}.js`,
    chunkFilename: `${aliases.vendor}.${aliases.suffix}.js`,
    path: paths.dist,
    publicPath: `/${aliases.dist}/`,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  }
};

/*
const webpackOptions = {
  shouldSplitChunks: false,
};

const webpackConfig = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;
  const isSync = !!argv.sync || false;
  
  const config = {
    entry: {
      panel: `${paths.source}/src/app/panel.js`,
    },
    output: {
      filename: `[name].${aliases.suffix}.js`,
      chunkFilename: `${aliases.vendor}.${aliases.suffix}.js`,
      path: paths.dist,
      publicPath: `/${aliases.dist}/`,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.json'],
      modules: [path.resolve(paths.source, aliases.src), 'node_modules'],
      alias: {
        '@': path.resolve(paths.source),
      },
      symlinks: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        global: 'window',
      }),
    ],
    optimization: {
      minimize: isProduction,
    },
    target: 'web',
    stats: {
      hash: false,
      colors: true,
      modules: false,
      version: false,
      children: false,
      entrypoints: false,
    },
    devtool: 'source-map',
    watchOptions: {
      ignored: /node_modules/,
    },
  };
  
  if (webpackOptions.shouldSplitChunks) {
    config.optimization.splitChunks = {
      chunks: 'all',
    };
  }
  
  if (isDevelopment) {
    //
  }
  
  if (isProduction) {
    //
  }
  
  return config;
};

module.exports = webpackConfig;
*/