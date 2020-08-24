<!-- TOC -->

- [v-if与v-for哪个优先级高](#v-if与v-for哪个优先级高)
- [key的作用](#key的作用)
- [双向绑定](#双向绑定)
  - [自定义组件使用v-model改变事件名或属性名](#自定义组件使用v-model改变事件名或属性名)
  - [v-model与.sync](#v-model与sync)
- [diff算法](#diff算法)
- [跨组件通信](#跨组件通信)
  - [父子组件通信](#父子组件通信)
  - [兄弟组件](#兄弟组件)
  - [跨层级关系](#跨层级关系)
- [Vuex](#vuex)
  - [定义](#定义)
  - [解决了哪些问题](#解决了哪些问题)
  - [使用场景](#使用场景)
  - [具体用法](#具体用法)

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
* v-model是v-bind:value与@input的语法糖
* .sync是v-bind:value与@update:value的语法糖
如果对自定义组件修改model属性，将event修改为update则两者相同。
v-model只能有一个，.sync可以修饰多个属性。

## diff算法
定义：虚拟DOM的产物，在vue中叫做patch，核心实现来自snabbdom，通过新旧虚拟DOM对比，将变化的地方转为为DOM操作。
必要性：在Vue1中每个dep都有专门的watch负责更新，项目规模变大就会成为性能瓶颈。vue2优化为一个组件只有一个watcher，即需要patch精确找出发生变化的地方。
在何处调用：数据发生变化时触发渲染作为watcher的getter函数的updateComponent函数中的vm._update(vm._render())，执行render函数得到新的newVNode，之后执行patch比对之前的oldVNode。
如何运作：
* 深度优先：如果有子节点优先比较子节点
* 同层比较：假设头尾节点可能相同先做尝试，没有相同节点再遍历查找
* 借助key来精准定位更新位置

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
EventBus.$on("event", (data) => console.log(data))
// remove event
EventBus.$off('event')
```

### 跨层级关系
* provide / inject
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
