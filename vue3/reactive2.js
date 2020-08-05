const isObject = v => typeof v === 'object' && v !== null

function reactive(obj) {
  // 对传入参数进行处理
  if (!isObject(obj)) return obj

  return new Proxy(obj, {
    get(target, key) {
      // 在这里还可以做一层缓存，如果已经代理过直接返回
      // Reflect
      const res = Reflect.get(target, key)
      // console.log('get', key, res)

      track(target, key)
      // 如果是对象，需要再次代理
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, val) {
      const res = Reflect.set(target, key, val) // boolean
      // console.log('set', key, res)

      trigger(target, key)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key) // boolean
      // console.log('delete', key, res)

      trigger(target, key)
      return res
    }
  })
}

// 存储响应函数
const effectStack = []

// 将fn转换为响应式函数
function effect(fn) {
  const e = createReactiveEffect(fn)

  // 立即执行
  e() // 执行了 reactiveEffect 的入栈，执行，出栈
  return e
}

function createReactiveEffect(fn) {
  const effect = function reactiveEffect(...args) {
    if (!effectStack.includes(effect)) {
      try {
        // 1.入栈
        effectStack.push(effect)
        // 2.执行
        // 在执行时如果args中有响应式数据，将触发getter，进而触发track
        return fn(...args)
      } catch (error) {
        console.log(error)
      } finally {
        // 3.出栈
        effectStack.pop()
      }
    }
  }
  return effect
}

const targetMap = new WeakMap()

// 依赖收集: 保存target/key与fn之间的映射关系
function track(target, key) {
  // 获取effect
  const effect = effectStack[effectStack.length - 1]
  if (effect) {
    let depMap = targetMap.get(target)
    if (!depMap) {
      depMap = new Map()
      targetMap.set(target, depMap)
    }
    // 获取key对应的回调set
    let deps = depMap.get(key)
    if (!deps) {
      deps = new Set()
      depMap.set(key, deps)
    }
    deps.add(effect)
  }
}

// 触发函数: 从映射关系中拿出响应函数数组并执行
function trigger(target, key) {
  const depMap = targetMap.get(target)
  if (!depMap) return
  const deps = depMap.get(key)
  if (deps) deps.forEach(dep => dep())
}

const obj = {key2: {n: 1}, key3: [1,2,3]}
const observed = reactive(obj)

// 指定一个响应式函数
effect(() => {
  console.log('key2', observed.key2)
})

observed.key2 = {}
