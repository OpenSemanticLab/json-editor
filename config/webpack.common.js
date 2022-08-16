const webpack = require('webpack')
const helpers = require('./helpers')
const CssToJSON = require('../build/CssToJson')
const bodyParser = require('body-parser');

const bannerText = `/**
* @name JSON Editor
* @description JSON Schema Based Editor
* This library is the continuation of jdorn's great work (see also https://github.com/jdorn/json-editor/issues/800)
* @version {{ VERSION }}
* @author Jeremy Dorn
* @see https://github.com/jdorn/json-editor/
* @see https://github.com/json-editor/json-editor
* @license MIT
* @example see README.md and docs/ for requirements, examples and usage info
*/`
module.exports = {
  entry: {
    jsoneditor: './src/core_anastasia.js'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js|\.css.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'usage',
                  corejs: 3,
                  debug: false
                }]
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: /(node_modules)|(src\/themes)|(src\/editors)/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(
      bannerText.replace(
        '{{ VERSION }}',
        JSON.stringify(require('../package.json').version)
      )
    ),
    new CssToJSON({
      pattern: './src/**/*.css'
    })
  ],
  performance: {
    hints: false
  },
  devServer: {
    contentBase: helpers.root('.'),
    historyApiFallback: true,
    port: 8080,
    inline: true,
    publicPath: '/',
    setup(app) {

      app.use(bodyParser.json());

      app.get("/get/json-schema", function (req, res) {
        console.log(req);
        res.send("GET res sent from webpack dev server")
      })

      app.post("/post/json-schema", bodyParser.json(), function (req, res) {
        console.log(req.body);
        res.send("POST res sent from webpack dev server")
      })

    }
  }
}
