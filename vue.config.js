'use strict'
const Path = require('path')
const bodyParser = require('body-parser')
var axios = require('axios')
function resolve (dir) {
  return Path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: false,
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
      app.post('/api/getPurlUrl', bodyParser.json(), function(req, res) {
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
        axios.post(url, req.body, {
          headers: {
            referer: 'https://y.qq.com',
            origin: 'https://y.qq.com',
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log('getPurlUrl-error' + e)
        })
      })
    }
  }
}
