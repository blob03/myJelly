const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

const Assets = [
    'native-promise-only/npo.js',
    'libarchive.js/dist/worker-bundle.js',
    'pdfjs-dist/build/pdf.worker.js'
];

const JassubWasm = [
    'jassub/dist/jassub-worker.wasm',
    'jassub/dist/default.woff2'
];

const LibarchiveWasm = [
    'libarchive.js/dist/wasm-gen/libarchive.js',
    'libarchive.js/dist/wasm-gen/libarchive.wasm'
];

const DEV_MODE = process.env.NODE_ENV !== 'production';

const NODE_MODULES_REGEX = /[\\/]node_modules[\\/]/;

const config = {
    context: path.resolve(__dirname, 'src'),
    target: 'browserslist',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [
            path.resolve(__dirname, 'node_modules')
        ]
    },
    plugins: [
        new DefinePlugin({
            __WEBPACK_SERVE__: JSON.stringify(!!process.env.WEBPACK_SERVE)
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            // Append file hashes to bundle urls for cache busting
            hash: true
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'themes/',
                    to: 'themes/'
                },
                {
                    from: 'assets/**',
                    globOptions: {
                        dot: true,
                        ignore: ['**/css/*']
                    }
                },
                {
                    from: '*.*',
                    globOptions: {
                        dot: true,
                        ignore: ['**.js', '**.html']
                    }
                }
            ]
        }),
        new CopyPlugin({
            patterns: Assets.map(asset => {
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, './dist/libraries')
                };
            })
        }),
        new CopyPlugin({
            patterns: LibarchiveWasm.map(asset => {
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, './dist/libraries/wasm-gen')
                };
            })
        }),
        new CopyPlugin({
            patterns: JassubWasm.map(asset => {
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, './dist')
                };
            })
        })
    ],
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].[contenthash].chunk.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: ''
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            cacheGroups: {
                node_modules: {
                    test(module) {
                        return NODE_MODULES_REGEX.test(module.context);
                    },
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        // if "packageName" is a namespace (i.e. @jellyfin) get the namespace + packageName
                        if (packageName.startsWith('@')) {
                            const parts = module.context
                                .substring(module.context.lastIndexOf(packageName))
                                .split(/[\\/]/);
                            return `node_modules.${parts[0]}.${parts[1]}`;
                        }

                        if (packageName === 'date-fns') {
                            const parts = module.context
                                .substring(module.context.lastIndexOf(packageName))
                                .split(/[\\/]/);

                            let name = `node_modules.${parts[0]}`;
                            if (parts[1]) {
                                name += `.${parts[1]}`;

                                if (parts[1] === 'locale' && parts[2]) {
                                    name += `.${parts[2]}`;
                                }
                            }

                            return name;
                        }

                        return `node_modules.${packageName}`;
                    }
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader'
                }
            },
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve(__dirname, 'node_modules/event-target-polyfill'),
                    path.resolve(__dirname, 'node_modules/rvfc-polyfill'),
                    path.resolve(__dirname, 'node_modules/@jellyfin/sdk'),
                    path.resolve(__dirname, 'node_modules/@remix-run/router'),
                    path.resolve(__dirname, 'node_modules/@uupaa/dynamic-import-polyfill'),
                    path.resolve(__dirname, 'node_modules/axios'),
                    path.resolve(__dirname, 'node_modules/blurhash'),
                    path.resolve(__dirname, 'node_modules/compare-versions'),
                    path.resolve(__dirname, 'node_modules/date-fns'),
                    path.resolve(__dirname, 'node_modules/dom7'),
                    path.resolve(__dirname, 'node_modules/epubjs'),
                    path.resolve(__dirname, 'node_modules/flv.js'),
                    path.resolve(__dirname, 'node_modules/libarchive.js'),
                    path.resolve(__dirname, 'node_modules/marked'),
                    path.resolve(__dirname, 'node_modules/react-router'),
                    path.resolve(__dirname, 'node_modules/screenfull'),
                    path.resolve(__dirname, 'node_modules/ssr-window'),
                    path.resolve(__dirname, 'node_modules/swiper'),
                    path.resolve(__dirname, 'src')
                ],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheCompression: false,
                        cacheDirectory: true
                    }
                }]
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'node_modules/jassub')
                ],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheCompression: false,
                        cacheDirectory: true,
                        presets: ['@babel/preset-env']
                    }
                }]
            },
            {
                test: /\.worker\.ts$/,
                exclude: /node_modules/,
                use: [
                    'worker-loader',
                    'ts-loader'
                ]
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader'
                }]
            },
            /* modules that Babel breaks when transforming to ESM */
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'node_modules/pdfjs-dist'),
                    path.resolve(__dirname, 'node_modules/xmldom')
                ],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheCompression: false,
                        cacheDirectory: true,
                        plugins: [
                            '@babel/transform-modules-umd'
                        ]
                    }
                }]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    DEV_MODE ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                config: path.resolve(__dirname, 'postcss.config.js')
                            }
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    DEV_MODE ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                config: path.resolve(__dirname, 'postcss.config.js')
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(mp3)$/i,
                type: 'asset/resource'
            },
            {
                test: require.resolve('jquery'),
                loader: 'expose-loader',
                options: {
                    exposes: ['$', 'jQuery']
                }
            }
        ]
    }
};

if (!DEV_MODE) {
    config.plugins.push(new MiniCssExtractPlugin());
}

module.exports = config;
