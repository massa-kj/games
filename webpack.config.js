const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', // production

    // 変換前のエントリーファイル
    entry: './src/index.tsx',

    // バンドルファイルの出力
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js', // 出力ファイル名
    },

    // ファイル変換
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',  
                            '@babel/preset-typescript',
                            ['@babel/preset-react', { runtime: 'automatic' }]
                        ],
                    }
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ],
    },

    // import時に省略対象を指定
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    devServer: {
        static: path.join(__dirname, '/dist'), //  webpackの出力先
        compress: true,
        port: 3000,
        open: false, //ブラウザ自動起動
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        })
    ]
};
