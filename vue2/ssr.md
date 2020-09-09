## 概念

可以将Vue组件在服务器端渲染为HTML字符串，将他们发送到浏览器，将这些静态标记激活为客户端上完全可交互的应用程序

与传统SPA相比，SSR的优势在于:
1. 更好的SEO
2. 更快的加载时间
缺点:
1. 浏览器特定代码，只能在生命周期钩子函数使用；外部拓展库需要特殊处理
2. 需要服务器有Node.js运行环境
3. 更多的浏览器端负载

如果只是希望改善少数页面的SEO则只需要**预加载**如prerender-spa-plugin
* 依赖puppeteer，需要下载Chromiumn内核（用于基于浏览器环境生成模板）

## 代码结构

```
build
  |-setup-dev-server.js // 创建devMiddleware(对更新的文件进行监控编译保存在内存)与hotMiddleware(对页面热重载)
  |-webpack.base.js // 规定output/module.rules[loader]与module.plugins
  |-webpack.client.js // 定义浏览器端专属entry，并引入VueSSRClientPlugin(用于生成vue-ssr-client-manifest.json)
  |-webpack.server.js // 定义浏览器端专属entry/output，并引入VueSSRServerPlugin(用于生成vue-ssr-server-bundle.json)
dist(dev环境保存在内存)
  |-vue-ssr-client-manifest.json // 包含了所有需要在客户端运行的脚本和静态资源
  |-vue-ssr-server-bundle.json // 包含了所有要在服务端运行的代码列表，和一个入口文件名
src
  |-app.js // 由双端调用，暴露createApp函数，其返回有app(Vue实例)/router/store对象
  |-App.vue // 根组件
  | // 每个组件中可定义asyncData方法
  |-entry-client.js // 浏览器端入口，主要定义了asyncData的mixin:在路由更新（beforeRouteUpdate）调用每个组件的asyncData来拿数据
  | //在初始化后立即读取window.__INITIAL_STATE__作为初始state
  |-entry-server.js // 触发组件的async方法通过触发store的dispatch拿数据
  | // 之后为文件export的函数的参数context赋值 context.state = store.state，经过VueSSRServerPlugin处理转换为window.__INITIAL_STATE__
  |-index.template.html
package.json
server.js
// 在dev环境watcher回调中读取实时构建好的bundle/template/clientManifest，在现网直接调用dist中的文件
// 通过vue-server-renderer的createBundleRenderer生成renderer，对不同路径的http请求返回SSR的HTML字符串
```

## 数据预取和状态
服务器端的store需要和浏览器端初始化store保持一致，否则：
* 服务器端报错: [vue-server-renderer] Component news-item implemented serverCacheKey, but no cache was provided to the renderer
* 浏览器端报错: The client-side rendered virtual DOM tree is not matching server-rendered content
即需要：
* 服务器端在每个路由匹配的组件数组(router.getMatchedComponents)通过Promise.all调用asyncData(在其中dispatch返回promise的action)，待数据读取完毕，通过为文件export的函数的参数context赋值 context.state = store.state，经过VueSSRServerPlugin处理转换为window.__INITIAL_STATE__
* 浏览器端在初始化后立即读取window.__INITIAL_STATE__作为初始state(store.replaceState)，在初始化后reslove前(beforeResolve)以及在路由更新（beforeRouteUpdate）调用每个组件的asyncData来拿数据

## 客户端激活
* 由于服务器已经渲染好了 HTML，我们显然无需将其丢弃再重新创建所有的 DOM 元素。相反，我们需要"激活"这些静态的 HTML，然后使他们成为动态的（能够响应后续的数据变化）。
* data-server-rendered 特殊属性，让客户端 Vue 知道这部分 HTML 是由 Vue 在服务端渲染的，并且应该以激活模式进行挂载。
* 在开发模式下，Vue 将推断客户端生成的虚拟 DOM 树 (virtual DOM tree)，是否与从服务器渲染的 DOM 结构 (DOM structure) 匹配。如果无法匹配，它将退出混合模式，丢弃现有的 DOM 并从头开始渲染。在生产模式下，此检测会被跳过，以避免性能损耗。

## Next
Nuxt.js 是一个基于 Vue.js 的服务端渲染应用框架。

```
npx create-nuxt-app <项目名>
```
### 目录
* components
* layouts
* middleware
* pages
* plugins
* static
* store
* nuxt.config.js
* package.json
