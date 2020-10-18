const path = require('path');
const packageRoot = require('app-root-path').path;
const fs = require('fs');
const WebpackHookPlugin = require('webpack-hook-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const root = [path.resolve(__dirname)];
module.exports = {
    entry: `${root}/src/index.ts`,
    target: 'node',
    node: {
        __dirname: true
    },
    externals: [
        /^[a-z\-0-9]+$/ // Ignore node_modules folder
    ],
    output: {
        filename: 'server.js', // output file
        path: `${root}/dist`,
        libraryTarget: "commonjs"
    },
    resolve: {
        // Add in `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json'],
        modules: [
            `${root}/node_modules`,
            'node_modules',
            `${packageRoot}/node_modules`
        ]
    },
    module: {
        rules: [{
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            test: /\.tsx?$/,
            use: ['cache-loader',  {
                loader: 'thread-loader',
                options: {
                    // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                    workers: require('os').cpus().length - 1,
                    poolTimeout: Infinity // set this to Infinity in watch mode - see https://github.com/webpack-contrib/thread-loader
                },
            },
            {
                loader: 'ts-loader',
                options: {
                    happyPackMode: true // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
                }
            }]
        }]
    },
    plugins: [
        new WebpackHookPlugin({
            onBuildEnd: ['nodemon dist/server.js']
          }),
          new ForkTsCheckerWebpackPlugin({
            typescript: {
              diagnosticOptions: {
                semantic: true,
                syntactic: true
              }
            }
          })
        ]
};
