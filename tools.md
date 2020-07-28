## Webpack优化

### 加快构建速度

1. `module.rules.include` 中填入include来配置该loader的寻找范围
```js
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      // 配置cacheDirectory来支持缓存
      use: ['babel-loader?cacheDirectory'],
      include: path.resolve(__dirname, 'src')
    }]
  }
}
```
2. 优化`resolve.modules`配置，指明第三方模块的绝对路径以指定寻找范围
```js
module.exports = {
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')]
  }
}
```
3. resolve.alias(更快查找模块依赖)
```js
module.exports = {
  resolve: {
    alias: {
      '@utilities': path.resolve(__dirname, 'src/utilities/'),
      '@templates': path.resolve(__dirname, 'src/templates/')
    }
  }
}
```

4. resolve.mainFields(指定针对ES5,ES6等环境提供不同的代码的入口文件)
从npm包导入模块时该选项决定在package.json中使用哪个字段导入模块，根据webpack.target不同默认值也会不同，target不设置则为mainFields数组第一项
当target设置为`webworker`, `web`或没有指定，默认值为`['browser', 'module', 'main']`，其他target(包括node)默认为`['module', 'main']`
如: D3的package含有这些字段，则意味着会引入browser指定的入口文件，指定target为node时则为module
```
{
  ...
  main: 'build/d3.Node.js',
  browser: 'build/d3.js',
  module: 'index',
  ...
}
```
6. resolve.extensions
后缀尝试列表要尽可能小/频率出现最高的文件后缀要优先放在最前
