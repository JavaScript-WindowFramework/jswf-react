const path = require("path");
const { createTransformer } = require("typescript-plugin-styled-components");
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
        use: [
          {
            loader: "ts-loader",
            options: {
              getCustomTransformers: () => ({
                before: [createTransformer({ minify: true, ssr: true })],
              }),
            },
          },
        ],
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
        test: /\.(jpg|png|gif)$/,
        type: "asset/inline",
      },
      {
        test: /\.(svg)$/,
        type: "asset/inline",
        use: [{ loader: "svgo-loader" }],
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
    "resize-observer-polyfill": true,
  },
};
config.devtool = "source-map";

module.exports = config;
