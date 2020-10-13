<!-- TOC -->

- [v-if与v-for哪个优先级高](#v-if与v-for哪个优先级高)
- [key的作用](#key的作用)
- [响应式原理](#响应式原理)
  - [getter](#getter)
  - [setter](#setter)
- [route与router的区别？](#route与router的区别)
  - [route](#route)
  - [router](#router)
- [router钩子函数](#router钩子函数)
- [keep-alive的作用](#keep-alive的作用)
- [组件与router中name的作用？](#组件与router中name的作用)
- [双向绑定](#双向绑定)
  - [自定义组件使用v-model改变事件名或属性名](#自定义组件使用v-model改变事件名或属性名)
  - [v-model与.sync](#v-model与sync)
- [diff算法](#diff算法)
  - [如何运作](#如何运作)
  - [为什么不要以index作为v-for的key](#为什么不要以index作为v-for的key)
- [跨组件通信](#跨组件通信)
  - [父子组件通信](#父子组件通信)
  - [兄弟组件](#兄弟组件)
  - [跨层级关系](#跨层级关系)
- [Vuex](#vuex)
  - [定义](#定义)
  - [解决了哪些问题](#解决了哪些问题)
  - [使用场景](#使用场景)
  - [具体用法](#具体用法)
  - [工作原理](#工作原理)
- [VueRouter中history模式和hash模式的异同](#vuerouter中history模式和hash模式的异同)

<!-- /TOC -->

## v-if与v-for哪个优先级高
结论：v-for优先于v-if被解析
为什么：如果将他们放到一起，可以发现先执行了循环在判断条件
怎么使用：实际使用时不应该这么做，会导致每次更新渲染时遍历整个列表。应该使用计算属性，使用过滤后的列表
文档中也出现过**永远不要把 v-if 和 v-for 同时用在同一个元素上**。

## key的作用
结论：为了更高效的更新VirtualDOM
为什么：diff算法的两个假设
1. 相同组件产生类似DOM结构，不同组件产生不同DOM结构
2. 同级的一组节点可以通过唯一id进行区分
可以使得Diff算法的复杂度从O(n^3)降到O(n)
当页面数组发生变化时Diff算法只会比较同层级的节点
* 如果节点类型不同，直接干掉前面的节点，插入新节点
* 如果节点类型相同，重新设置该节点属性来更新
例：A-E节点的BC之间插入F
多个相同类型节点在默认diff算法下会F-D一个个更新属性，最后插入一个原有元素E
加入key后Diff算法可以识别该节点，找到正确位置直接插入
同标签名元素的过渡切换(transition)也会用到key属性，否则无法触发

## 响应式原理
_init->initState->initData
取出data代理到vm，并执行observe(data)
将dep实例化对象赋值到__ob__
### getter
在getter调用时会触发dep.depend->Dep.target.addDep(this)->dep.addSub(this)
将该dep推进watcher实例的deps数组，在作为响应式变量属性的dep的subs数组添加了当前watcher实例
### setter
在setter调用时调用dep.notify，对在该dep的subs中的watcher触发update函数。
调用queueWatcher函数，通过nextTick分别执行watcher的getter函数（对于渲染watcher就是vm._update(vm._render()))，再执行回调函数。

## route与router的区别？
### route
$route，表示当前的路由信息，每个路由都有一个route对象，包含url解析得到的信息:路径，参数，query等
RouterView执行render时会触发root._route的getter，绑定依赖，执行transitionTo修改app._route时又触发了setter通知RouterView的渲染watcher更新
### router
$router是通过VueRouter构造函数得到的router实例对象，包含所有路由，关键的属性与方法
* `$router.push/replace({ path: 'home' })/go(-1)` 向history栈中添加/替换一个路由/历史前进/后退。
* `path/params/query/router/matched/name`

## router钩子函数
* 全局守卫 `beforeEach(to, from, next)`
* 全局解析守卫(2.5.0+) `beforeResolve` 在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被调用
* 全局后置钩子`afterEach(to, from)` 路由解析后触发，无法通过next改变路由
* 路由独享守卫`beforeEnter(to, from, next)`
```js
new VueRouter({
  routes: [{
    path: ...,
    component: Foo,
    beforeEnter(to, from, next) {}
  }]
})
```
* 组件独享`beforeRouteEnter/beforeRouteUpdate(被复用)/beforeRouteLeave`
```js
const Foo = {
  template: `...`,
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
  },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
  },
  beforeRouteLeave (to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  }
}
```

## keep-alive的作用
* Vue提供的一个抽象组件（不会被渲染为DOM元素），用来对组件进行缓存，从而节省性能。
* 当组件在keep-alive内被切换时组件的activated、deactivated这两个生命周期钩子函数会被执行
* 被包裹在keep-alive中的组件的状态将会被保留，例如我们将某个列表类组件内容滑动到第100条位置，那么我们在切换到一个组件后再次切换回到该组件，该组件的位置状态依旧会保持在第100条列表处。
* 如果想复原滚动状态，可以在new VueRouter时定义scrollBehavior参数函数，return { x: 0, y: 0 }

## 组件与router中name的作用？
* 当项目使用keep-alive时，可搭配name进行缓存过滤`<keep-alive exclude/include="Home"(排除/只缓存哪些组件)></keep-alive>`
* 组件自己的模板递归调用自身
```js
<template>
  <div>
    ...
    <detail-list/>
  </div>
</template>
<script>
 export default {
   name: 'DetailList'
 }
</script>
```

* 通过name属性，为一个页面中不同的router-view渲染不同的组件
```html
<!-- 将Hello组件渲染在name为Hello的router-view中，其余的渲染在默认组件 -->
<div id="app">
  <router-view></router-view>
  <router-view name="Hello"></router-view>
</div>
```
* 通过name传参，使用$router.name获取name值
* 通过router-link传参
```
var router = new VueRouter({
  routes: [
    { name:'register', path: '/register/:id/:name', component: register }
  ]
})
<router-link :to="{name:'register',params:{id:10,name:'lili'}}">注册</router-link>
```
* push/replace方法`this.$router.push({name: 'register'})`

## 双向绑定
定义：是指指令v-model，可以绑定一个动态值到视图，同时视图变化可以改变该值，相当于v-bind:value与@input的语法糖
好处：减少大量事件处理代码，提高开发效率
使用：通常在表单使用，原生表单项可以直接使用，自定义组件需要绑定
实现：输出包含v-model的组件渲染函数，会complier被转换为value属性的绑定与一个事件监听

### 自定义组件使用v-model改变事件名或属性名
```js
Vue.component('base-checkbox', {
  // 直接定义model属性
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: Boolean
  },
  template: `<input
    type="checkbox"
    v-bind:checked="checked"
    v-on:change="$emit('change', $event.target.checked)">`
})

<base-checkbox v-model="lovingVue"></base-checkbox>
```

### v-model与.sync
* v-model是v-bind:key与@input的语法糖
* .sync是v-bind:key与@update:key的语法糖
如果对自定义组件修改model属性，将event修改为update则两者相同。
v-model只能有一个，.sync可以修饰多个属性。

## diff算法
定义：虚拟DOM的产物，在vue中叫做patch，核心实现来自snabbdom，通过新旧虚拟DOM对比，将变化的地方转为为DOM操作。
必要性：在Vue1中每个dep都有专门的watch负责更新，项目规模变大就会成为性能瓶颈。vue2优化为一个组件只有一个watcher，即需要patch精确找出发生变化的地方。
在何处调用：数据发生变化时触发渲染作为watcher的getter函数的updateComponent函数中的vm._update(vm._render())，执行render函数得到新的newVNode，之后执行patch比对之前的oldVNode。

### 如何运作
* 不是相同节点: isSameNode为false则销毁旧的vnode渲染新的vnode（即diff为同层对比）
* 是相同节点： 调用patchVNode方法。如果新vnode是文字，则直接替换，否则对children进行对比
* 有新children则addVNodes没新的则removeVNode，都存在则进行diff：updateChildren
* 在一个while循环中不断对新旧节点两端进行对比(旧首新首/旧尾新尾/旧首新尾/旧尾新首)，将指针不断向内部收缩，直到没有节点可以对比。
```js
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      )
    )
  )
}
```
### 为什么不要以index作为v-for的key
如果对数组进行reverse操作，生成的`newChildren`中的props会倒置，但是key的顺序不变，被判断为相同节点，需要进行patchVNode导致优化失效。
删除除末尾的其他项也会导致同样的问题。

## 跨组件通信
### 父子组件通信
* props
* $emit/$on
* $parent/$children
* ref
* $attrs/$listerners
$attrs包含了父作用域中不作为prop被识别的特性绑定（class和style除外）
```vue
<script>
Vue.component('child', {
  props: ['name'],
  created() {
    console.log(this.$attrs) // 已经在props中声明过name,返回 {age: 20, gender: 'man'}
  }
})
</script>
<template>
  <child child name="joe" age="20" gender="man"></child>
</template>
```
如果在孙元素添加属性 v-bind="$attrs"可以将参数继续向下传递。优先级低于其他属性。

$listeners包含了父作用域中的v-on事件监听器，可以通过v-on="$listeners"传入孙组件。
```vue
<script>
created() {
  console.log(this.$listeners) // [customEvent: fn]
}
</script>
<template>
  <child @click.native="" @custom></child>
</template>
```
### 兄弟组件
* $parent
* eventbus
* vuex

```js
// eventbus.js
export const EventBus = new Vue()
// A.vue
EventBus.$emit('event', 'data');
// B.vue
EventBus.$on('event', (data) => console.log(data))
// remove event
EventBus.$off('event')
```

### 跨层级关系
* provide / inject (提供/添加)
* $root
* eventbus
* vuex

provide/inject: 一个祖先组件向所有子孙后代组件注入一个依赖，不论层次有多深始终生效。
```js
// father
export default {
  name: 'Father',
  provide: {
    message: 'provided by father'
  },
  components: {
    Son
  }
}
// son
export default {
  name: 'Son',
  components: { grandSon }
}
// grandson
export default {
  inject: ['message'],
  created() {
    console.log(this.message); // provided by father
  }
}
```
## Vuex
### 定义
Vue专用的状态管理库，以全局方式集中管理应用的状态，可以保证状态变更的可预测性。
### 解决了哪些问题
多组件（>=2）之间的状态共享。通过把组件的共享状态抽取出来，以全局单例模式管理，任何组件都能用一致的方式获取和修改，保证单向数据流动。
### 使用场景
如果不是大型单页应用或没有大量全局状态需要维护，没有使用的必要，否则，如同Redux的作者说的“Flux架构就像眼睛，自会知道什么时候使用它”
### 具体用法
* state: 使用store.state或配套的mapState访问某个状态
* getter: 组件中使用store.getters或配套的mapGetters访问派生状态
* mutation: 可以用store.commit或配套的mapMutations方法修改状态
* action: 用store.dispatch或配套的mapActive方法异步提交mutation
* module
```js
const moduleA = {
  state: {},
  getter: {},
  mutations: {},
  action
}
const store = Vuex.store({
  modules: {
    moduleA
  }
})

// use
export default {
  computed: {
    ...mapGetters(namespace, ['fnName'])
  }
}
```

### 工作原理
* computed
首先参考一下computed。在响应式数据getter中，dep.Target存在时调用dep.depend()，将当前数据的dep对象中的subs插入该watcher。setter中调用dep.notify，使得具有该依赖的watcher全部更新。

每一个computed属性都生成了自己的Watcher（lazy版本，在有被访问时才更新）传入getter为本身定义函数，调用了defineComputed方法。

* 插件
Vuex插件在所有组件的beforeCreate注入了this.$store对象。在业务中需要写以下代码
```js
const store = new Vuex.Store({
  state,
  mutations,
  actions,
  modules
})

// 在Vuex.Store的构造函数中有：
// 重点方法 ，重置VM
resetStoreVM(this, state)

function resetStoreVM (store, state, hot) {
  // 省略无关代码
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
```
将传入的state作为一个隐藏Vue组件的data，commit操作就是改变data值，setter中lazy watcher的dirty被设置为true，下次访问将获取到最新值


## VueRouter中history模式和hash模式的异同

* `#`即hash符号，Router的hash模式利用了window可以监听onhashchange事件变化做出相应。
* h5中history被添加了pushState/replaceState方法，可以将url替换并且不刷新页面。需要服务器端配合将根路径下都定向到index.html
