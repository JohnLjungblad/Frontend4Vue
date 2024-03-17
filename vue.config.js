const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
    ? '/Frontend4Vue/'
    : '/',
  transpileDependencies: true,
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].template = './public/index.html';
      return args;
    });
  }
});
