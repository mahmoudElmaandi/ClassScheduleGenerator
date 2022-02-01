const webpack = require("webpack");
const path = require('path')
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    // mode: 'production',
    mode: 'development',
    watch: true,
    // module: {
    //     rules: [
    //         {
    //             test: /\.css$/,
    //             use: ['style-loader', 'css-loader']
    //         },
    //     ],
    // }
};