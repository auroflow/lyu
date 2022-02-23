// ┌─────────────────────┐
// │      targetMap      │
// │    type: WeakMap    │
// │                     │
// │  key     │  value   │    ┌──────────────────┐
// │          │          │    │    depsMap       │
// │ reactive │    ──────┼───►│   type: Map      │
// │ objects  │          │    │                  │
// │          │          │    │  key     │ value │     ┌──────────────┐
// └──────────┴──────────┘    │          │       │     │    dep       │
//                            │ property │       │     │  type: Set   │
//                            │ name     │   ────┼────►│              │
//                            │          │       │     │   effects    │
//                            └──────────┴───────┘     │   to re-run  │
//                                                     │   when the   │
//                                                     │   property   │
//                                                     │   updates    │
//                                                     └──────────────┘

// An effect is a piece of code that we wish to re-run when its dependencies update.
type Effect = Function

// The currently active effect.
let activeEffect: Effect | null = null

// targetMap saves the depsMap for each target object as illustrated above.
const targetMap = new WeakMap<Object, Map<string, Set<Effect>>>()

// track() is called when we GET a property of a reactive object.
function track(target: Object, key: string) {
  // we only want to track the target in an effect
  if (!activeEffect) return

  // Make sure the active effect is being tracked.
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // the depsMap for the target does not exist.
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    // the dep does not exist for the property
    dep = new Set()
    depsMap.set(key, dep)
  }

  dep.add(activeEffect)
}

// trigger() is called when we SET a property of a reactive object.
function trigger(target: Object, key: string) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return

  let dep = depsMap.get(key)
  if (!dep) return

  // Run all effects related to the property
  dep.forEach((eff) => {
    eff()
  })
}

// Generate reactive objects using ES6 proxy.
export function reactive<T>(target: T): T {
  const handler = {
    get(_target: Object, key: string, receiver: any) {
      // Using reflect ensures the proper value of `this` is used
      // when the object has inherited values or functions from
      // another object.
      let result = Reflect.get(_target, key, receiver)
      track(_target, key)
      return result
    },
    set(_target: Object, key: string, value: any, receiver: any) {
      let oldValue = Reflect.get(_target, key, receiver)
      let result = Reflect.set(_target, key, value, receiver)
      if (result && oldValue !== value) {
        trigger(_target, key)
      }
      return result
    },
  }

  return new Proxy(target, handler) as T
}

// The GET operations in the effect will be tracked.
export function effect(eff: Effect) {
  activeEffect = eff
  eff()
  activeEffect = null
}

// ref() takes an inner value and creates a reactive, mutable object,
// whose value property points to the inner value.
// ref() allows us to create a "reference" to any value and pass it
// around without losing reactivity.
// This piece of code uses JavaScript closure. See section 8.6 of
// "JavaScript: the Definitive Guide."
export function ref(raw: any = null) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return raw
    },
    set value(newVal) {
      // to prevent dead loop. See comments on
      // https://www.bilibili.com/video/BV1SZ4y1x7a9
      if (raw !== newVal) {
        raw = newVal
        trigger(refObject, 'value')
      }
    },
  }

  return refObject
}

// computed() is a sugar for creating a ref.
// It receives a getter function.
type Getter = () => any

export function computed(getter: Getter) {
  let result = ref()
  effect(() => (result.value = getter()))
  return result
}
