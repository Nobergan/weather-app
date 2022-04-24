const chokidar = require("chokidar");
const os = require("os");
const process = require("process");
const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const HtmlWebpackSkipAssetsPlugin =
  require("html-webpack-skip-assets-plugin").HtmlWebpackSkipAssetsPlugin;
// import { Carousel } from 'bootstrap';

const isDev = process.env.NODE_ENV === "development";
// let chrome = 'chrome';
let chrome;
switch (process.platform) {
  case "linux":
    chrome = "google-chrome";
    break;
  case "darwin":
    chrome = "Google Chrome";
    break;
  default:
    chrome = "chrome";
    break;
}
// INSERT NEW CONFIGS HERE
const configs = [createConfig() /*createConfig("news")*/];

configs.forEach((config, index) => (config.devServer.port = 8080 + index));
module.exports = configs;

function createConfig(configName = "") {
  const name = configName || "main";
  const config = {
    name: configName || "main",
    mode: isDev ? "development" : "production",
    entry: `./src/${name}/index.js`,

    output: {
      publicPath: isDev ? "" : "assets/",
      assetModuleFilename: "[contenthash][ext]",
      filename: isDev ? "index.js" : "js/index.[fullhash].js",
      path: path.resolve(__dirname, `dist/${configName}/assets/`),
    },

    devtool: isDev ? "eval-cheap-module-source-map" : false,
    devServer: {
      onBeforeSetupMiddleware(server) {
        chokidar
          .watch(
            [`./src/${name}/templates/**/*.html`, `./src/${name}/index.ejs`],
            {
              ignorePermissionErrors: true,
            }
          )
          // .on("change", () => {
          //   server.sockWrite(server.sockets, "content-changed");
          // });
      },
      devMiddleware: {
        publicPath: `/`,
      },

      hot: true,
      host: getMyLocalIP(),
      open: true,
      client: {
        overlay: {
          warnings: true,
          errors: true,
        },
      },
    },

    optimization: {
      usedExports: true,
      minimizer: [
        new TerserPlugin({
          exclude: [path.resolve(__dirname, "node_modules"), /\.min.js$/],
          parallel: true,
          terserOptions: {
            output: {
              comments: false,
            },
          },
        }),
      ],
    },

    plugins: [
      // new CountUp(),
      new MiniCssExtractPlugin({
        filename: "css/styles.[fullhash].css",
      }),
      new HtmlWebpackPlugin({
        disable: isDev,
        // filename: isDev ? `index.html` : "../index.php",
        filename: `index.html`,
        template: `./src/${name}/index.ejs`,
        minify: false,
        inject: "body",
        // excludeAssets: isDev ? [] : [/\.js$/],
      }),
      new HtmlWebpackSkipAssetsPlugin({}),
    ],
    module: {
      rules: [
        {
          test: /\.(ttf|woff|woff2|eot)$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[contenthash].[ext][query]",
            //   filename: pathdata => {
          },
        },
        {
          test: /\.css$/,
          use: [
            isDev
              ? "style-loader"
              : {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    publicPath: "../",
                  },
                },

            // {
            //   loader: "postcss-loader",
            //   options: {
            //     sourceMap: isDev,
            //   },
            // },
            {
              loader: "css-loader",
              options: {
                sourceMap: isDev,
                importLoaders: 1,
              },
            },
            // {
            //   loader: "resolve-url-loader",
            //   options: {},
            // },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            isDev
              ? "style-loader"
              : {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    publicPath: "../",
                  },
                },

            {
              loader: "css-loader",
              options: {
                sourceMap: isDev,
                importLoaders: 1,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: isDev,
              },
            },
            {
              loader: "resolve-url-loader",
              options: {},
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.html$/i,
          use: [
            {
              loader: "html-loader",
              options: {
                esModule: false,
                minimize: {
                  removeComments: true,
                  collapseWhitespace: false,
                  conservativeCollapse: false,
                },
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          type: "asset/resource",
          generator: {
            filename: "img/[contenthash][ext][query]",
          },
          use: [
            {
              loader: "image-webpack-loader",
              options: {
                disable: isDev,
              },
            },
          ],
        },
      ],
    },
  };

  // if (!isDev) {
  //   console.log("name is", name);
  //   config.plugins.push(
  //     new PurgecssPlugin({
  //       paths: glob.sync(`${path.join(__dirname, `src/${name}/templates/**/*`)}`, { nodir: true }),
  //       whitelistPatterns: [/modal/, /aos/, /irs/],
  //       safelist: [/reset/],
  //       // only: [name],
  //     })
  //   );
  // }

  if (config.name === "main") {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "src/main/js/copy"),
            to: `${isDev ? "assets/" : ""}js/`,
            noErrorOnMissing: true,
          },
          {
            from: path.resolve(__dirname, "src/main/css"),
            to: `${isDev ? "assets/" : ""}css`,
            noErrorOnMissing: true,
          },
        ],
      })
    );
  }

  return config;
}
function getMyLocalIP() {
  const nets = Object.values(os.networkInterfaces());
  let ips = [];

  for (const net of nets) {
    const filtered = net.filter(
      (item) => item.family === "IPv4" && item.address !== "127.0.0.1"
    );
    if (filtered.length) {
      ips = [...ips, ...filtered];
    }
  }
  return ips[0].address;
}
