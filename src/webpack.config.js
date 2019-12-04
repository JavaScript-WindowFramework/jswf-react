const path = require("path");

const config = {
  //mode: "development",
  mode: "production",
  entry: [path.resolve(__dirname, "index.ts")],
  output: {
    //library: "@jswf/react",
    libraryTarget: "commonjs",
    filename: "index.js",
    path: path.resolve(__dirname, "../dist")
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
              modules: true
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.(jpg|png|svg|gif)$/,
        loaders: "url-loader"
      }
    ]
  },
  resolve: {
    symlinks: false,
    extensions: [".ts", ".tsx", ".js", ".scss", "css", ".svg"]
  },
  devtool: "source-map",
  externals: {
    react: "react",
    "react-dom":"react-dom",
    // "@jswf/manager":"@jswf/manager",
    "styled-components": "styled-components",
    "resize-observer-polyfill": "resize-observer-polyfill"
  }
};
if (config.mode === "development") {
  config.devtool = "source-map";
}
module.exports = config;
