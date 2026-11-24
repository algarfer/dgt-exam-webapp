import { rspack } from "@rspack/core";
import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";

const isDev = process.env.NODE_ENV === "development";

const publicPath = process.env.PUBLIC_PATH ?? "/";

export default {
  mode: isDev ? "development" : "production",
  entry: { main: "./src/main.tsx" },
  output: {
    path: new URL("dist", import.meta.url).pathname,
    publicPath,
    filename: isDev ? "[name].js" : "[name].[contenthash:8].js",
    cssFilename: isDev ? "[name].css" : "[name].[contenthash:8].css",
    assetModuleFilename: "assets/[name].[contenthash:8][ext]",
    clean: true,
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx"],
    alias: {
      "@": new URL("src", import.meta.url).pathname,
    },
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|jsx|ts|tsx)$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            detectSyntax: "auto",
            jsc: {
              transform: {
                react: {
                  development: isDev,
                  refresh: isDev,
                },
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css/auto",
      },
      {
        test: /\.svg$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: "./src/index.html" }),
    new rspack.CopyRspackPlugin({
      patterns: [{ from: "public", noErrorOnMissing: true }],
    }),
    isDev && new ReactRefreshRspackPlugin(),
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          reuseExistingChunk: true,
        },
      },
    },
  },
  devServer: {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "localhost",
    historyApiFallback: true,
  },
  devtool: isDev ? "eval-cheap-module-source-map" : "source-map",
};
