'use strict'
const Path = require('path')

function resolve(dir) {
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
    //别名配置的另一个方法
    // chainWebpack(config) {
    //     config.resolve.alias
    //         .set('@', resolve('/src'))
    //         .set('common', resolve('/src/common'))
    // }, 
}