const path = require("path")

module.exports = {
  entry: "./server/index.ts",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "armada.server.js",
    path: path.resolve(__dirname, "dist")
  }
}
