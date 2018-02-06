
'use strict';

var ExtractTextPlugin = require("extract-text-webpack-plugin");  //css单独打包
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var webpack = require('webpack');
module.exports = {

    entry: {
        main: './src/components/nav.js', //唯一入口文件
        vendor: ['react']
    },
    output: {
        path: './src/', //打包后的文件存放的地方
        filename: 'main.js', //打包后输出文件的文件名
        publicPath: '/src/'  //启动本地服务后的根目录
    },

    module: {
        loaders: [
            { test: /\.js$/, loader: "jsx!babel", include: /src/},
            { test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css!postcss")},
            { test: /\.scss$/, loader: ExtractTextPlugin.extract("style", "css!postcss!sass")},
            { test: /\.(png|jpg|gif)$/, loader: 'url?limit=819200'}
        ]
    },

    babel: {
        presets: ['es2015', 'stage-0', 'react'],
        plugins: ['transform-runtime', ['import', {
          libraryName: 'antd',
          style: 'css'
        }]]
    },

    postcss: [
        require('autoprefixer')    //调用autoprefixer插件,css3自动补全
    ],

    devServer: {
        //contentBase: './src' , //本地服务器所加载的页面所在的目录
        port: 8080,
        colors: true,  //终端中输出结果为彩色
        historyApiFallback: true,  //不跳转
        inline: true  //实时刷新
    },

    plugins: [
        new ExtractTextPlugin('main.css'),
        new CommonsChunkPlugin({
           name: 'vendor',
           filename: 'vendor.js'
        }),
        new webpack.DefinePlugin({
            "process.env": { 
               NODE_ENV: JSON.stringify("production") 
             }
          })
    ]

}
