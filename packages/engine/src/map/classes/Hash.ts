// TODO(perf) would something like megahash help?
// import HashMap from 'megahash'

interface Options<Value> {
  defaultValue?: Value
}

export default class Hash<Value> {
  map: Map<string, Value>
  defaultValue: Value

  constructor(iterable: Iterable<[string, Value]> = [], options: Options<Value> = {}) {
    this.map = new Map(iterable)
    if (typeof options.defaultValue !== 'undefined') {
      this.defaultValue = options.defaultValue
    }
  }

  set(key: string, value: Value) {
    this.map.set(key, value)
    return this
  }

  get(key: string) {
    if (this.map.has(key)) {
      return this.map.get(key)!
    } else {
      return this.defaultValue
    }
  }

  delete(key: string) {
    return this.map.delete(key)
  }

  keys() {
    return this.map.keys()
  }

  values() {
    return this.map.values()
  }

  clear() {
    this.map.clear()
  }
}
