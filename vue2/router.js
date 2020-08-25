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
    this.app = null
    let mode = options.mode || 'hash'
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) mode = 'hash'
    if (!inBrowser) mode = 'abstract'
    this.mode = mode
  }
}

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
        this._routerRoot = this
        this._router = this.$options.router
        Vue.util.defineReactive(this, '_route', this._router.history,current)
      } else {
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
