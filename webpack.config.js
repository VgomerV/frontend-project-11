import path from 'path';
import htmlWebpackPlugin from 'html-webpack-plugin';

export default {
  mode: 'production',
  entry: {
    filename: path.resolve(process.cwd(), 'src/js/index.js'),
  },
  output: {
    path: path.resolve(process.cwd(), 'public'),
    filename: 'index.js',
  },
  devServer: {
    port: 9000,
    compress: true,
    hot: true,
    static: {
      directory: path.join(process.cwd(), 'public'),
    },
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      title: 'RSS aggregator',
      filename: 'index.html',
      template: 'index.html',
    }),
  ],
};
