const path = require('path');
const packageRoot = require('app-root-path').path;
const fs = require('fs');
const WebpackHookPlugin = require('webpack-hook-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const dev = process.env.NODE_ENV !== 'production';

const root = [path.resolve(__dirname)];
const plugins = [new ForkTsCheckerWebpackPlugin({
    typescript: {
        diagnosticOptions: {
            semantic: true,
            syntactic: true
        }
    }
})];
if (dev) plugins.push(new WebpackHookPlugin({
    onBuildEnd: ['nodemon dist/server.js --watch src/**, dist/server.js']
}));
const buildOptions = dev ? {
    // there should be 1 cpu for the fork-ts-checker-webpack-plugin
    workers: require('os').cpus().length - 1
} : {};

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
            // Cache loader references cached files before trying to rebuild them
            use: [
                {
                    // Process typescript only after caching and threading have been initializeds
                    loader: 'ts-loader',
                    options: {
                        happyPackMode: true // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
                    }
                }]
        }]
    },
    plugins
};
