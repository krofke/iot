// vue.config.js
module.exports = {
  devServer: {
    clientLogLevel: "warn",
  },

  configureWebpack: {
    devtool: 'source-map'
  },

  publicPath : "/sso/",

  pluginOptions: {
    quasar: {
      importStrategy: 'manual',
      rtlSupport: false
    }
  },

  transpileDependencies: [
    'quasar'
  ]
}
