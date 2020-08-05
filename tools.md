<!-- TOC -->

- [Webpack优化](#webpack优化)
  - [加快构建速度](#加快构建速度)
  - [优化打包文件体积（webpack-bundle-analyzer）](#优化打包文件体积webpack-bundle-analyzer)
  - [优化使用体验（webpack-dev-server）](#优化使用体验webpack-dev-server)

<!-- /TOC -->

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
5. resolve.extensions
后缀尝试列表要尽可能小/频率出现最高的文件后缀要优先放在最前

6. module.noParse
不去解析不引用其他包的库

```js
module.exports = {
  module: {
    noParse: /jquery/
  }
}
```

7. HappyPack 多线程处理 loader任务

```js
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
// 由于HappyPack 对file-loader、url-loader 支持的不友好，所以不建议对该loader使用
module.exports = {
  plugins: [
    new HappyPack({
      //用id来标识 happypack处理那里类文件
      id: 'happyBabel',
      //如何处理  用法和loader 的配置一样
      loaders: [{
        loader: 'babel-loader?cacheDirectory=true',
      }],
      //共享进程池
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: true,
    })
  ]
}
```

8. ParallelUglifyPlugin 多线程处理压缩任务

```js
module.exports = {
  plugins: [
    // 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码
    new ParallelUglifyPlugin({
      // 传递给 UglifyJS 的参数
      uglifyJS: {
        output: {
          // 最紧凑的输出
          beautify: false,
          // 删除所有的注释
          comments: false,
        },
        compress: {
          // 在UglifyJs删除没有用到的代码时不输出警告
          warnings: false,
          // 删除所有的 `console` 语句，可以兼容ie浏览器
          drop_console: true,
          // 内嵌定义了但是只用到一次的变量
          collapse_vars: true,
          // 提取出出现多次但是没有定义成变量去引用的静态值
          reduce_vars: true,
        }
      },
    }),
  ],
};
```

### 优化打包文件体积（webpack-bundle-analyzer）

`npm i -D webpack-bundle-analyzer`

```js
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
module.exports = {
  plugins:[
    ...,
    new BundleAnalyzerPlugin({
      analyzerHost:'127.0.0.1',
      analyzerPort: 8889
    })
  ]
}
```

在package.json中加入配置

`"analyz": "NODE_ENV=production npm_config_report=true npm run build"`

接下来npm run analyz浏览器会自动打开文件依赖图的网页

### 优化使用体验（webpack-dev-server）
* webpack --watch 是直接打包，文件多了很慢
* webpack 无法热更新，需要手动更新
```js
// 原始webpack.config.js文件写法
module.exports = {
  entry: './src/js/index.js'
  output: {
    path: './dist',
    filename: 'bundle.js'
  }
}
```

启动webpack-dev-server后，在目标文件夹是看不到编译后文件的，实时编译后文件都保存到了内存中

`iframe-mode`
```js
`webpack-dev-server --content-base ./dist`
```
浏览器的访问路径为`localhost:8080/webpack-dev-server/index.html`，会访问`client/index.html`文件，其中会请求live.bundle.js文件，通过js新建Iframe并注入应用，同时js中包含socket.io的client代码，这样就和server建立了ws通讯。


`inline-mode`
```js
`webpack-dev-server --inline --content-base ./dist`
```
浏览器的访问路径为为`localhost:8080/index.html`。服务会在webpack.config.js的入口配置文件再添加一个入口:
```js
module.exports = {
  entry: {
    app: ['webpack-dev-servewr/client?http://localhost:8080']
  }
}
```
将inlinejs打包进了bundle.js中。该js包含了socket.io的client代码，这样就和server建立了ws通讯。

`hot replace`
```js
webpack-dev-server --hot --inline --content-base ./dist
```
