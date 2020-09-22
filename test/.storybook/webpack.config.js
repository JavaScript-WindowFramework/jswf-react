module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve("babel-loader"),
        options: {
          presets: [
            [
              "react-app",
              {
                corejs: 3,
              },
            ],
          ],
        },
      },
      {
        loader: require.resolve("@storybook/source-loader"),
        options: { injectParameters: true },
      },
    ],
  });
  config.resolve.extensions.push(".ts", ".tsx");
  return config;
};
