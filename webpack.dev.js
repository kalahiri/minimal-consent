const CopyWebpackPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const parentWebPack = require('./webpack.common.js');

module.exports = merge(parentWebPack, {
    mode: 'development',
    /**
     * Only one that works on FF
     * Issue on webpack: https://github.com/webpack/webpack/issues/1194
     * Issue on web-ext toolbox: https://github.com/webextension-toolbox/webextension-toolbox/issues/58
     */
    // FIX: Module not found: Error: Can't resolve 'fs'
    node: {fs: 'empty'},
    target: 'web',
    devtool: 'inline-source-map',
    plugins: [
        new CopyWebpackPlugin([
            /* This is required for Integration Testing */
            {
                from: './node_modules/jasmine-core/lib/jasmine-core/*.*',
                to: './test/jasmine-core/',
                flatten: true,
            },
            {from: './src/manifest.dev.json', to: './manifest.json'},
            {from: './src/images/', to: './images/'},
            {from: './src/js/popup/popup.html', to: './popup/'},
            {from: './src/js/options/options.html', to: './options/'},
            {from: './src/test/', to: './test/'},
            {from: './src/_locales/', to: './_locales/'}])
    ],

    /* This is how the test Page will be available on the page */
    entry: {
        './test/tests/integration/all.spec': './src/test/tests/integration/all.spec.js',
    }
});
