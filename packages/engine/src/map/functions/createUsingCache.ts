import { IArrayKeyedMap } from '../types'

export default function createUsingCache<CacheKey extends any[], Value>(create: (...args: CacheKey) => Value) {
  return (cache: IArrayKeyedMap<CacheKey, Value>, createArgs: CacheKey) => {
    let value = cache.get(createArgs)
    if (!value) {
      value = create(...createArgs)
      cache.set(createArgs, value)
    }
    return value
  }
}
