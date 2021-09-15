export default function createUsingGetSet<CacheKey extends any[], Value>(create: (...args: CacheKey) => Value) {
  return (get: (key: CacheKey) => Value, set: (key: CacheKey, value: Value) => any, createArgs: CacheKey) => {
    let value = get(createArgs)
    if (!value) {
      value = create(...createArgs)
      set(createArgs, value)
    }
    return value
  }
}
