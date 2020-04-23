module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve("babel-loader"),
        options: {
          presets: [require.resolve("babel-preset-react-app")],
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
