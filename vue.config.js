const path = require('path');
const webpack = require('webpack');

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],

  configureWebpack: {
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    plugins: [
      new webpack.ProvidePlugin({
        'jQuery': 'jquery',
        '$': 'jquery',
        '$utils': path.resolve(__dirname, 'src/utils/'),
        '$http': path.resolve(__dirname, 'src/utils/http'),
        'options': {
            rules:[
                {
                    test: '/\.scss$/',
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                            }
                        }
                    ]
                }
           ]
         }
      })
    ]
  },

  devServer: {
    proxy: {
      '^/wp': {
        target: 'http://192.168.61.192',
        pathRewrite: {'^/static': ''}
      },
      '/rpc': {
        target: 'http://194.87.111.126:8080/sin-web/',
        pathRewrite: {'^/rpc': ''},
        changeOrigin: true,
        cookiePathRewrite:{
            "/rpc": "sin-web",
            "*": "sin-web"
        }
      },
      '^/api': {
        target: 'http://194.87.111.126:8080/',
        pathRewrite: {'^/api': ''}
      }
    }
  },

  publicPath: '',

  pluginOptions: {
    cordovaPath: 'src-cordova'
  }
};
