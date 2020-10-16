const path = require('path')
const packageRoot = require('app-root-path').path;

const root = [path.resolve(__dirname)]
const WebpackShellPlugin = require('webpack-shell-plugin');
console.log("PACKAGE ROOT", packageRoot)
module.exports = {
    entry: `${root}/src/index.ts`,
    target: 'node',
    stats: {
        logging: 'verbose'
      },
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
    resolveLoader: {
        // root: [`${root}/node_modules`, `${packageRoot}/node_modules`, 'node_modules']
    },
    module: {
        rules: [{
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            test: /\.tsx?$/,
            use: [
                {
                    loader: 'ts-loader',
                }
            ]
        }]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        (process.env.NODE_ENV !== 'production') ? new WebpackShellPlugin({onBuildEnd: ['nodemon dist/server.js --watch build']}) : () => { }
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\/]node_modules[\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
};
