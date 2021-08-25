const path = require('path');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
    // In order for live reload to work we must use "web" as the target not "browserlist"
    target: 'web',
    mode: 'development',
    entry: './scripts/site.js',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                enforce: 'pre',
                use: ['source-map-loader']
            },
            {
                test: /\.(ts|tsx)$/,
                enforce: 'pre',
                use: ['source-map-loader']
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
	port: 9000,
	host: '192.168.2.98'
    }
});
