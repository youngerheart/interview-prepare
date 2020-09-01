## HelloWorld
Node.js服务器是一个长期运行的进程，如果创建一个单例对象，将在每个传入的请求间共享，容易导致交叉请求状态污染，应该暴露可以可重复执行的工厂函数，为每个请求创建新的实例。
```js
// app.js
const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync(path.join(__dirname, './index.html'), 'utf-8')
})
module.exports = function createApp (context) {
  const app = new Vue({
    data: {
      url: content.url
    },
    template: `<div>访问的URL是{{url}}</div>`
  })
  return { app }
}

// server.js
server.get('*', (req, res) => {
  const context = { url: req.url }
  const { app } = createApp(context)

  renderer.renderToString(app, (err, html) => {
    // 处理错误……
    res.end(html)
  })
})
```

## 使用webpack的源码结构
```
src
├── components
│   ├── Foo.vue
│   ├── Bar.vue
│   └── Baz.vue
├── App.vue
├── app.js # 通用 entry(universal entry)
├── entry-client.js # 仅运行于浏览器
└── entry-server.js # 仅运行于服务器
```

```js
// entry-client.js
import createApp from './app'

// 客户端特定引导逻辑……

const { app } = createApp()

// 这里假定 App.vue 模板中根元素具有 `id="app"`
app.$mount('#app')

// entry-server.js

import createApp from './app'

export default context => {
  const { app } = createApp()
  return app;
}
```

## 路由

服务器代码中直接使用 * 接收任何URL，使访问url传入Vue程序，在客户端与服务端复用相同路由配置。

```js
// router.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
      // ...
    ]
  })
}

// app.js

export function createApp () {
  const router = createRouter()
  const app = new Vue({
    router,
    render: h => h(App) // app.vue
  })

  return { app, router }
}

// entry-server.js
// 实现服务器路由逻辑
import { createApp } from './app'
export default context => {
  // 有可能是异步钩子函数或组件，所以返回一个Promise
  return new Promise((resolve, reject) => {
    const { app, router } = createApp()
    router.push(context.url)
    // router将异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      // 这时再resolve实例
      resolve(app)
    }, reject)
  })
}

// server.js
server.get('*', (req, res) => {
  const context = { url: req.url }
  createApp(context).then(app => {
    renderer.renderToString(app, (err, html) => {
      if (err) res.status(err.code).end(err)
      else res.end(html)
    })
  })
})

server.listen(3000, () => {
  console.log('服务已开启')
})

// entry-client.js
import createApp from './app'
const {app, router} = createApp()
// router需要提前解析异步组件以调用可能存在的路由钩子
router.onReady(() => {
  app.$mount('#app')
})
```

## 代码分割

Vue提供异步组件作为第一类概念，与webpack2所支持的动态导入作为代码分割点。

```js
// router.js
Vue.use(Router)
export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [{
      path: '/', component: () => import('./components/Home.vue')
    }]
  })
}
```
