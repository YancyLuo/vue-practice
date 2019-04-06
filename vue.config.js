'use strict'
const Path = require('path')
var axios = require('axios')
function resolve (dir) {
  return Path.join(__dirname, dir)
}

module.exports = {
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('/src'),
        'common': resolve('/src/common'),
        'components': resolve('/src/components')
      }
    }
  },
  // 别名配置的另一个方法
  // chainWebpack(config) {
  //     config.resolve.alias
  //         .set('@', resolve('/src'))
  //         .set('common', resolve('/src/common'))
  // },
  devServer: {
    before (app) {
      app.get('/api/getDiscList', function (req, res) {
        var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.info(e)
        })
      })
    }
  }
}
