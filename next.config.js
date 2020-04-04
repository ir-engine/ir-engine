// next.config.js
const withSass = require('@zeit/next-sass')
module.exports = {
  withSass({
    /* config options here */
  }) { },
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.(css|scss)/,
        loader: "emit-file-loader",
        options: {
          name: "dist/[path][name].ext"
        }
      },
      {
        test: /\.css#/,
        use: ["babel-loader", "raw-loader", "postcss-loader"]
      },
      {
        test: /\.s(a|c)ss$/,
        use: [
          "babel-loader", "raw-loader", "postcss-loader", "sass-loader"
        ]
      }
    )
    return config
  }
}