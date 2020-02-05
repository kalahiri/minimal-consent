const CopyWebpackPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const parentWebPack = require('./webpack.common.js');

module.exports = merge(parentWebPack, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new CopyWebpackPlugin([
            {from: './src/manifest.dev.json', to: './manifest.json'},
            {from: './src/images/', to: './images/'},
            {from: './src/popup/', to: './popup/'},
            {from: './src/_locales/', to: './_locales/'}])
    ]
});
