/* 流程
Vue的插件安装
Vue有静态use方法，在其中调用插件本身或install函数，对参数unshift传入Vue并执行，将插件push到installedPlugins数组
Vue有静态mixin方法，将该插件的配置项与钩子函数绑定至所有Vue实例

VueRouter的install方法：
首先加锁确保install只执行一次，输出一个_Vue用于插件内部使用
调用Vue.mixin，在beforeCreate中为实例添加
_routerRoot: 当前实例
this._router: 配置项中的router(new Vue时传入的参数)
this._router.init(this) // 执行初始化函数
执行registerInstance(this, this)
在destroyed中执行registerInstance(this)
随后将实例$router与$route代理到_routerRoot的_router，_route

VueRouter的实例化：
构造函数中初始化
this.app: 组件根Vue实例
this.options: 传入的路由配置
this.xxHooks一些钩子函数
this.mode: 创建路由的模式
this.history: 路由历史的具体实现实例

实例化后传入vue配置项，在Mixin的beforeCreate会执行其init(this)方法:
储存实例到apps属性，根据不同的mode定义Listener，执行transitionTo方法
在其第一行执行了matcher.match方法，该matcher由createMatcher(router-实例, routes-用户定义路由配置)得到，最终会返回一个route类型对象
之后执行confirmTransition方法，执行resolveQueue生成待更新/已更新/已失活列表，封装上各个生命周期并调用

url变化：
当点击router-link最终会执行router.push函数，先执行this.transitionTo做路径切换，在切换完成的回调函数中执行pushHash函数。
调用浏览器原生的history.pushState或replaceState方法更新url并将当前url压入历史栈中。
在History初始化中会设置一个监听器，监听历史栈的变化，变化时同样执行transitionTo方法。

组件：
install过程中注册了RouterView和RouterLink组件
RouterView
RouterView是一个函数型组件，其render函数中首先会取route（当前路径，会被动态改变）
该路径在执行过transitionTo-updateRoute后会被赋值。
RouterView支持嵌套，render中定义了depth概念来表示嵌套深度
如果父节点也是RouterView则depth++，之后根据匹配路径和depth找到对应RouteRecord，进而找到该渲染的组件。
再定义一个注册路由实例的方法，在beforeCreate钩子中执行，给matched.instance[name]赋值当前组件的vm实例。
render函数最终根据component渲染出对应组件vonde
RouterView执行render时会触发root._route的getter，绑定依赖，执行transitionTo修改app._route时又出发了setter通知RouterView的渲染watcher更新。
RouterLink
支持在具有路由功能的应用中导航。
* 兼容history或hash模式
* history模式下回守卫点击事件，不在重新加载页面
* 使用base选项后，所有to属性都不需要写base路径
其渲染基于render函数，首先做了路由解析，生成最终跳转href，并为组件添加activeClass
创建一个守卫函数，监听点击事件或其他可通过prop传入的事件类型，最终执行router.push/replace函数。

总结：
路由始终维护当前线路，路由切换会把当前线路切换到目标线路，执行导航守卫的钩子函数，更改url，渲染对应组件。
切换完毕会把当前线路替换为目标线路，为下一次切换提供依据。
*/

// Vue use 逻辑
function Vue() {
}

Vue.options = {}
Vue.config = {
  optionMergeStrategies: []
}
initUse(Vue)
initMixin(Vue)
initComponent(Vue)

function initUse(Vue) {
  Vue.use = function(plugin) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) return this
    const args = Array.from(arguments)
    // 传入参数Vue
    args.unshift(this)
    // 支持install属性或者自身为函数的情况
    if (typeof plugin.install === 'function') plugin.install.apply(plugin, args)
    else plugin.apply(null, args)
    installedPlugins.push(plugin)
    return this
  }
}

function initMixin(Vue) {
  Vue.mixin = function(mixin) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}

function initComponent(Vue) {
  Vue.component = function() {}
}

function mergeOptions(options, newOptions) {
  Object.keys(newOptions).forEach(key => options[key] = newOptions[key]);
  return options;
}

const VueRouter = function() {
  return {
    install
  }
}
// Vue Router install逻辑
class VueRouter {
  constructor(options = {}) {
    this.app = null // 根Vue实例
    this.apps = []
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this)
  
    let mode = options.mode || 'hash'
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) mode = 'hash'
    if (!inBrowser) mode = 'abstract'
    this.mode = mode
    // 根据mode初始化history属性
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break;
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break;
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break;
      default:
        console.log(`invaild mode ${mode}`)
        break;
    }
  }

  // 在mixin的beforeCreate中触发该初始化函数
  init(app) {
    this.apps.push(app)
    if (this.app) return
    this.app = app
    const history = this.history
    // 切换路由
    if (history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation())
    } else if (history.getCurrentLocation()) {
      const setupHashListener = () => {
        history.setupListeners()
      }
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      )
    }
    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })
  }
  match (raw, current, redirectedFrom) {
    return this.matcher.match(raw, current, redirectedFrom)
  }

  push (location, onComplete, onAbort) {
    this.history.push(location, onComplete, onAbort)
  }

  setupListeners() {
    window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', () => {
      if (!ensureSlash()) return;
      this.transitionTo(getHash, route => {})
    })
  }
}

function ensureSlash() {
  // 自动为裸页面增加/#/
}

let _Vue

function install(Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true
  _Vue = Vue
  const isDef = v => v !== undefined
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) i(vm, callVal)
  }
  // 利用minin将钩子函数注入到每一个组件
  Vue.mixin({
    beforeCreate() {
      if (isDef(this.$options.router)) {
        // 根组件
        this._routerRoot = this // 根Vue实例
        this._router = this.$options.router
        this._router.init(this) // 执行初始化函数
        Vue.util.defineReactive(this, '_route', this._router.history,current)
      } else {
        // 子组件
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed() {
      registerInstance(this)
    }
  })
  Object.defineProperty(Vue.prototype, '$router', {
    get () {
      return this._routerRoot._router
    }
  })
  Object.defineProperty(Vue.prototype, '$route', {
    get () {
      return this._routerRoot._route
    }
  })
  const View = {}
  const Link = {}

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}

// History
class HTML5History extends History {
  constructor(router, base) {
    super(router, base)
  }
}

class HashHistory extends History {
  constructor(router, base) {
    super(router, base)
  }
}

class AbstractHistory extends History {
  constructor(router, base) {
    super(router, base)
  }
}

class History {
  constructor() {
    this.current = _createRoute(null, {path: '/'})
  }
  transitionTo(location, onComplete, onAbort) {
    /**
     * current: history维护的当前路径(Route类型对象)
     */
    const route = this.router.match(location, this.current)
    this.confirmTransition(route, () => {
      this.updateRoute(route)
      if (onComplete) onComplete(route)
      if (!this.ready) {
        this.ready = true
      }
    }, (err) => {
      if (onAbort) onAbort(err)
      if (!this.ready) {
        this.ready = true
      }
    })
  }
  confirmTransition(route, onComplete, onAbort) {
    if (isSameRoute(route, current)) {
      this.ensureUrl()
      return onAbort()
    }
    function resolveQueue (current, next) {
      const max = Math.max(current.length, next.length)
      for (i = 0; i < max; i++) {
        if (current[i] !== next[i]) break
      }
      return {
        updated: next.slice(0, i), // 0到i时一样的
        activated: next.slice(i), // next独有部分
        deactivated: current.slice(i) // current失活的部分
      }
    }
    const { updated, deactivated, activated } = resolveQueue(this.current.matched, route.matched)
    const queue = [].concat(extractLeaveGuards(deactivated), this.router.beforeHooks, extractUpdateHooks(updated), activated.map(m => m.beforeEnter), resolveAsyncComponents(actived))
    /**
     * 1. 在失活组件调用离开守卫beforeRouteLeave
     * 2. 调用全局beforeEach守卫
     * 3. 重用组件中调用beforeRouterUpdate守卫
     * 4. 在激活的路由配置中调用beforeEnter
     * 5. 解析异步路由，返回一个导航守卫函数，有标准to/from/next参数
     */

    // 异步函数队列化执行
    function runQueue (queue, fn /**iterator函数 */, cb) {
      const step = index => {
        // 最终执行回调
        if (index >= queue.length) cb()
        else if (queue[index]) {
          fn(queue[index], () => step(index + 1))
        } else step(index + 1)
      }
      step(0)
    }
    const iterator = (hook/**NavigationGuard */, next) => {
      if (this.pending !== route) return about()
      try {
        // 执行导航守卫hook
        // 对应文档中to, from与next方法，所以只有执行next函数才会前进到下一个导航钩子函数
        hook(route, this.current, (to) => {
          if (to === false) about(to)
          else if (to.path && to.name) {
            if(typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else next(to)
        })
      } catch (e) {
        about(e)
      }
    }
    runQueue(queue, iterator, () => {})
  }
  // hash子类实现
  push(location, onComplete, onAbort) {
    const { current } = this
    // 执行路径切换，之后执行pushHash
    this.transitionTo(location, route => {
      pushHash(route.fullPath)
      onComplete(route)
    }, onAbort)
  }
}

function pushHash (path) {
  if (supportsPushState) {
    // 支持hash方法，执行pushState方法
    pushState(path)
  } else window.location.hash = path
}

const supportsPushState = (function() {
  const ua = window.navigator.userAgent
  let isOld = ['Android 2.', 'Mobile Safari', 'Chrome', 'Windows Phone'].every(item => ua.indexOf(item) === -1)
  if (isOld) return false
  return window.history && 'pushState' in window.history
})()

function pushState(url, replace) {
  saveScrollPosition()
  const history = window.history
  try {
    // 改变
    if (replace) {
      history.replaceState(history.state, '', url)
    } else {
      history.pushState(history.state, '', url) // 通常调用这个
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url) // 直接跳转
  }
}

// Matcher
function createMatcher (routes, router) {
  // const Foo = { template: '<div>foo</div>' }
  // const Bar = { template: '<div>bar</div>' }

  // const routes = [
  //   { path: '/foo', component: Foo },
  //   { path: '/bar', component: Bar }
  // ]
  // 创建一个路由映射表path-routeRecord, name-routeRecord
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  // 动态增加路由
  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  function match (raw/* history.getCurrentLocation() */, currentRoute /* history.current */, redirectedFrom) {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location
    /*
     * 计算出新的location后
     * 有name就根据nameMap匹配record，如果不存在则返回空路径
     * 有path时由于其包含path不能很快找到路径，需要遍历pathList，通过matchRoute根据之前生成的regex顺序匹配
     * 匹配到则通过_createRoute生成新路径
     */
    if (name) {
      const record = nameMap[name]
      if (!record) return _createRoute(null, location)
      if (record) {
        location.path = '...'
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      location.params = {}
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        if (matchRoute(record.regex, location.path, location.params)) {
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }
    return _createRoute(null, location)
  }
  // 其实还要传一个router
  // 根据record与location创建出一条Route路径
  function _createRoute (record, location, redirectedFrom) {
    let query = location.query || {}
    const route = {
      name: location.name || record.name,
      meta: record.meta,
      path: location.path,
      hash: location.hash,
      query,
      params: location.params,
      matched: record ? formatMatch(record) : [] // 父级链表
    }
    function formatMatch (record) {
      let res = []
      while (record) {
        res.unshift(record)
        record = record.parent
      }
      return res
    }
    if (redirectedFrom) route.redirectedFrom = redirectedFrom
    return Object.freeze(route)
  }
  return {
    match,
    addRoutes
  }
}

function createRouteMap (routes, oldPathList, oldPathMap, oldNameMap) {
  const pathList = oldPathList || [] // 储存所有path
  const pathMap = oldPathMap || {} // path到routeRecord的映射关系
  const nameMap = oldNameMap || {} // name到routeRecord的映射关系
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })
  return {
    pathList,
    pathMap,
    nameMap
  }
}

function addRouteRecord(pathList, pathMap, nameMap, route, parent, matchAs) {
  const normalizedPath = normalizePath(path, parent)

  const record = {
    // 规范后的路径
    path: normalizedPath,
    // 将path解析为正则表达式的拓展
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.component, // 组件对象
    instances: {}, // 组件的实例
    parent, // 父级RouteRecord，通过该属性得到树形结构
  }
  if (route.children) {
    // 基于parent形成树形结构
    route.children.forEach(child => {
      const childMatchAs = matchAs ? cleanPath(`${matchAs}/${child.path}`) : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }
  if (route.alias !== undefined) {
    const aliases = Array.isArray(route.alias) ? route.alias : [route.alias]
    aliases.forEach(alias => {
      const aliasRoute = {
        path: alias,
        children: route.children
      }
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/'
      )
    })
    // 当pathMap不存在该record，为pathList和pathMap增加一条记录
    if (!pathMap[record.path]) {
      pathList.push(record.path)
      pathMap[record.path] = record
    }
    if (name && !nameMap[name]) nameMap[name] = record
  }
}

function normalizeLocation(raw/* history.getCurrentLocation() */, current /* history.current */, append, router) {
  let next = typeof raw === 'string' ? { path: raw } : raw
  if (next.name || next._normalized) return next
  if (!next.path && next.params && current) {
    /* 处理raw的情况-有params且没有path
     * 如果current有name则得到的location也有name
     */
    return next
  }
  // 有path
  return {
    _normalized: true,
    path,
    query,
    hash
  }
}

Vue.use(VueRouter)

// 1. 定义（路由）组件。
// 可以从其他文件 import 进来
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。
const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
})

// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
const app = new Vue({
  el: '#app',
  render(h) {
    return h(App)
  },
  router
})
