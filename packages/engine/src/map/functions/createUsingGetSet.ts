export default function createUsingGetSet<CacheKey extends any[], Value>(create: (...args: any[]) => Value) {
  return (
    get: (key: CacheKey) => Value,
    set: (key: CacheKey, value: Value) => any,
    key: CacheKey,
    ...extraArgs: any[]
  ) => {
    let value = get(key)
    if (!value) {
      value = create(...extraArgs, ...key)
      set(key, value)
    }
    return value
  }
}
