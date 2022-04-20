const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = {
    entry: {
        complete: [
            './src/js/idrviewer.js',
            './src/js/idrviewer.fullscreen.js',
            './src/js/idrviewer.querystring-navigation.js',
            './src/js/idrviewer.annotations.js',
            './src/js/idrviewer.search.js',
            './src/templates/complete/script.js',
        ],
        clean: [
            './src/js/idrviewer.js',
            './src/js/idrviewer.fullscreen.js',
            './src/js/idrviewer.querystring-navigation.js',
            './src/js/idrviewer.annotations.js',
            './src/templates/clean/script.js',
        ],
        simple: [
            './src/js/idrviewer.js',
            './src/js/idrviewer.querystring-navigation.js',
            './src/js/idrviewer.annotations.js',
            './src/templates/simple/script.js',
        ],
        slideshow: [
            './src/js/idrviewer.js',
            './src/js/idrviewer.fullscreen.js',
            './src/js/idrviewer.querystring-navigation.js',
            './src/js/idrviewer.annotations.js',
            './src/templates/slideshow/script.js',
        ],
    },
    optimization: {
        minimize: true,
    },
    output: {
        // filename: '[name]/bundle.js',
        path: path.resolve(__dirname, 'examples'),
        publicPath: '/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/templates/complete/index.html',
            filename: 'complete/index.html',
            minify: false,
            inject: false,
            chunks: ['complete'],
            cache: false,
        }),
        new HtmlWebpackPlugin({
            template: './src/templates/clean/index.html',
            filename: 'clean/index.html',
            minify: false,
            inject: false,
            chunks: ['clean'],
            cache: false,
        }),
        new HtmlWebpackPlugin({
            template: './src/templates/simple/index.html',
            filename: 'simple/index.html',
            minify: false,
            inject: false,
            chunks: ['simple'],
            cache: false,
        }),
        new HtmlWebpackPlugin({
            template: './src/templates/slideshow/index.html',
            filename: 'slideshow/index.html',
            minify: false,
            inject: false,
            chunks: ['slideshow'],
            cache: false,
        }),
        new HtmlInlineScriptPlugin(),
    ],
};