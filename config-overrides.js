const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer/"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "util": require.resolve("util/"),
    "fs": false,
    "net": false,
    "tls": false,
    "dns": false,
    "url": require.resolve("url/"),
    "process/browser": require.resolve("process/browser"),
    "process": require.resolve("process/browser")
  };

  // Add plugins
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Add rule to handle .mjs files
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });

  // Ignore source map warnings from xlsx
  config.ignoreWarnings = [
    { module: /node_modules\/xlsx\/xlsx\.mjs/ },
    { file: /node_modules\/xlsx\/xlsx\.mjs/ }
  ];

  return config;
};
