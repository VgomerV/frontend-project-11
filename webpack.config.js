import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  mode: 'production',
  entry: {
    filename: path.resolve(process.cwd(), 'src/index.js'),
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'index.js',
  },
  devServer: {
    port: 8080,
    compress: true,
    hot: true,
    static: {
      directory: path.join(process.cwd(), 'dist'),
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
    new HtmlWebpackPlugin({
      title: 'RSS aggregator',
      filename: 'index.html',
      template: 'index.html',
    }),
  ],
};
