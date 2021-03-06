<!-- TOC -->

- [Webpack的作用](#webpack的作用)
  - [loader与plugin的区别](#loader与plugin的区别)
- [Webpack优化](#webpack优化)
  - [加快构建速度](#加快构建速度)
  - [优化打包文件体积（webpack-bundle-analyzer）](#优化打包文件体积webpack-bundle-analyzer)
  - [优化使用体验（webpack-dev-server）](#优化使用体验webpack-dev-server)
- [webpack tree-shaking原理](#webpack-tree-shaking原理)
  - [DCE消除dead code](#dce消除dead-code)
  - [Tree-shaking消除无用模块](#tree-shaking消除无用模块)

<!-- /TOC -->

## Webpack的作用

### loader与plugin的区别
* loader负责对于模块源码的转换
描述了如何处理非javascript模块，并在build中引入这些依赖，如ts转js，image转data Url
* 常用loader
样式：css-loader；文件: url-loader；编译: babel-loader；校验：eslint-loader
* 写一个简单的loader：将文本类文件转为字符串到js文件
```js
// this.cacheable/this.value是loader的api，可以将结果标记为可缓存和把值传给下一代
module.exports = function(content) {
  this.cacheable && this.cacheable()
  this.value = content
  return 'module.exports = ' + JSON.stringify(content)
}
```

* plugin用于解决loader无法实现的其他事，通过钩子可以涉及整个构建流程，可以做一些在构建范围内的事情。
* 常用plugin
webpack4内置`terser-webpack-plugin`，用于压缩和混淆代码
`html-webpack-plugin`根据模板生成html代码，并自动引用css和js文件。
`webpack.DefinePlugin`编译时设置全局变量
`HotModuleReplacementPlugin`添加后在entry中增加入口，或直接在命令中输入--hot --inline
`compression-webpack-plugin`采用gzip压缩js和css
* 写一个webpack插件
  1. 编写一个js命名函数
  2. 在其原型上定义apply方法
  3. 指定挂载的事件钩子
  4. 处理特定数据
  5. 完成功能后调用webpack提供的回调
  
```js
function FileListPlugin(options) {
  console.log(options)
}
FileListPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    var fileList = 'In this build:\n'
    for (var filename in compilation.assets) {
      filelist += `-${filename}\n`
    }
    compilation.assets['filelist.md'] = {
      source() {
        return filelist
      },
      size() {
        return filelist.length
      }
    }
    // 执行完毕
    callbabck()
  })
}
```

* webpack插件钩子
`compile`编译(可以得到compilation对象)`emit`生成文件
* compiler对象代表配置完备的webpack环境，只在Webpack启动时构建一次，由webpack组合配置项构建生成
* compilation 对象代表了一次单一的版本构建和生成资源。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，一次新的编译将被创建，从而生成一组新的编译资源。

## Webpack优化

### 加快构建速度
* `module.rules.include` 指定loader的可查找路径
* `resolve.module` 指定第三方库的路径
* `resolve.alias` 别名，加快模块查找速度
* `mainFields` 在`package.json`中定义，`resolve.mainFields`中使用，根据环境按优先级指定入口文件
* `resolve.extensions` 按优先级指定需要解析的后缀
* `module.noParse` 不去解析该模块的依赖
* `HappyPack` 多线程处理loader任务
* `ParallelUglifyPlugin` 多线程处理压缩任务

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
如: D3的package.json含有这些字段，则意味着会引入browser指定的入口文件，指定target为node时则为module
```js
// package.json
module.exports = {
  mainFields: {
    ...
    main: 'build/d3.Node.js',
    browser: 'build/d3.js',
    module: 'index',
    ...
  }
}
```
5. resolve.extensions
后缀尝试列表要尽可能小/频率出现最高的文件后缀要优先放在最前

6. module.noParse
不去解析属性值代表的库的依赖

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

接下来npm run analyz浏览器会自动打开文件依赖图的网页，可看到每个文件的大小。

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

## webpack tree-shaking原理
传统DCE(dead code elimination)消灭不可执行代码，Tree-shaking 更关注于消除没有用到的代码。

### DCE消除dead code
* 不会被执行，不可到达(如return之后的代码)
* 执行结果不会被用到(不会被赋值)
* 只会影响死变量（只写不读）
* uglify完成了js的DCE
### Tree-shaking消除无用模块
通过ES6 module做静态分析（webpack自带了）
特点：依赖关系是确定的（不可动态引入），和运行时的状态无关
* 只能作为模块顶层的语句出现
* import 的模块名只能是字符串常量
* import binding是不变的
试验：
* webpack 中可以对模块的未使用函数做消除
* 不可以对未使用的类做消除，因为模块中可能做了除定义模块外的拓展，如定义Array.prototype的属性
