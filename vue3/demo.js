function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}

function reactive(obj) {
  if (!isObject(obj)) return obj
  return new Proxy(obj, {
    get(target, key) {
      // 在这里还可以做一层缓存，如果已经代理过直接返回
      const res = Reflect.get(target, key)
      track(target, key)
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key) // boolean
      trigger(target, key)
      return res
    }
  })
}

// 储存响应函数
const effectStack = []
function effect(fn) {
  const e = createReactiveEffect(fn)
  e()
  return e
}

const createReactiveEffect = (fn) => {
  const effect = function createEffect(...arg) {
    try {
      // 入库
      effectStack.push(fn)
      // 调用
      fn(...arg)
    } catch (error) {
      console.log(error)
    } finally {
      effectStack.pop()
    }
  }
  return effect
}

const targetMap = new WeakMap()

function track(target, key) {
  const effect =  effectStack[effectStack.length - 1]
  if (effect) {
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
}

function trigger(target, key) {
  const depMap = targetMap.get(target)
  if (!depMap) return
  const deps = depMap.get(key)
  if (deps) deps.forEach(dep => dep())
}

const obj = {a: {b: 1}}
const observed = reactive(obj)

effect(() => {
  console.log('changed', observed.a.b)
})

observed.a.b++
