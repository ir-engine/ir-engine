const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'src/index.ts',
    library: '$',
    libraryTarget: 'umd',
  },
  externals: [ nodeExternals() ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: 'three-volumetric.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devtool: 'sourceMap',
};
