const path = require("path");

const config = {
  mode: "production",
  entry: [path.resolve(__dirname, "index.ts")],
  output: {
    libraryTarget: "commonjs",
    filename: "index.js",
    path: path.resolve(__dirname, "../dist"),
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.(scss|css)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(jpg|png|svg|gif)$/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    symlinks: false,
    extensions: [".ts", ".tsx", ".js", ".scss", "css", ".svg"],
  },
  devtool: "source-map",
  externals: {
    react: true,
    "@jswf/manager": true,
    "styled-components": true,
    "resize-observer-polyfill": true
  },
};
config.devtool = "source-map";

module.exports = config;
