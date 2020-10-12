const isObject = arg => typeof arg === 'object' && arg !==null;

// 对传入参数进行处理，返回Proxy响应式对象
function reactive(obj) {
  // 对传入参数进行处理，如果不是对象则可以直接返回
  if (!isObject(obj)) return obj
  return new Proxy(obj, {
    get(target, key) {
      // TODO做一层缓存，如果已经代理过则直接返回
      // 使用到了Reflect，作用：命令式编程转函数式编程
      const res = Reflect.get(target, key)
      // 进行依赖收集
      track(target, key)
      // 如果结果是对象，还需要进行一次绑定
      return isObject(res) ? reactive(res) : res

    },
    set(target, key, val) {
      // 返回bool值: 是否设置成功
      const res = Reflect.set(target, key, val)
      // 触发响应函数
      trigger(target, key)
      return res
    },
    deleteProperty(target, key) {
      // 返回bool值: 是否设置成功
      const res = Reflect.set(target, key, val)
      // 触发响应函数
      trigger(target, key)
      return res
    }
  })
}

// 暂存响应函数
const effectStack = []

// 将用到响应式数据的fn转化为响应式函数
function effect(fn) {
  const e = createReactiveEffect(fn)
  // 立即执行一遍，用于建立响应式关系
  e()
  return e
}

function createReactiveEffect(fn) {
  // 新创建一个函数包裹原有的，实现更多功能
  const effect = function reactiveEffect(...args) {
    if (!effectStack.includes(fn)) {
      try {
        // 1.入栈（函数嵌套时建立依赖关系，需要用栈实现）
        effectStack.push(fn)
        // 2.执行
        // 在执行函数时如果其中有响应式数据，会触发getter，触发track逻辑
        // 执行时的报错需要抛出
        return fn(...args)
      } catch (error) {
        console.log(error)
      } finally {
        // 3. 出栈
        effectStack.pop()
      }
    }
  }
  return effect
}

// 储存响应式对象
// {[target]: {[key]: effectSet}}
const targetMap = new WeakMap()

function track(target, key) {
  // 获取effect
  const effect = effectStack[effectStack.length - 1]
  if (!effect) return
  let depMap = targetMap.get(target)
  if (!depMap) {
    depMap = new Map()
    targetMap.set(target, depMap)
  }
  let deps = depMap.get(key)
  if (!deps) {
    deps = new Set()
    depMap.set(key, deps)
  }
  deps.add(effect)
}

function trigger(target, key) {
  const depMap = targetMap.get(target)
  if (!depMap) return
  const deps = depMap.get(key)
  if (deps) deps.forEach(dep => dep())
}

const obj = {
  key2: { n: 1 }
}

let observed = reactive(obj)

effect(() => {
  console.log('key2 changed', observed.key2.n)
})

// 改变n，监听key2->监听不到
// 改变key2，监听n->可以监听
observed.key2 = {n: 2};
