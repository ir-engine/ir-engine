import { ITuple, MapStateUnwrapped } from '../types'

export default function createUsingGetSet<CacheKey extends ITuple, Value>(
  create: (state: MapStateUnwrapped, key: CacheKey, ...args: any[]) => Value
) {
  return (
    get: (key: CacheKey) => Value,
    set: (key: CacheKey, value: Value) => any,
    state: MapStateUnwrapped,
    key: CacheKey,
    ...extraArgs: any[]
  ) => {
    let value = get(key)
    if (!value) {
      value = create(state, key, ...extraArgs)
      set(key, value)
    }
    return value
  }
}
