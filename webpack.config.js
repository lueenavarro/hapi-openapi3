const path = require("path");
const nodeExternals = require("webpack-node-externals");
const DtsBundleWebpack = require("dts-bundle-webpack");
const pkg = require("./package.json");

module.exports = {
  entry: "./src/index.ts",
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new DtsBundleWebpack({
      name: pkg.name,
      main: "dist/src/index.d.ts",
      baseDir: "dist",
      out: "bundle.d.ts",
    }),
  ],
  output: {
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs2",
  },
};
