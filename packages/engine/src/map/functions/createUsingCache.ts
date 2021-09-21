import { IArrayKeyedMap } from '../types'
import createUsingGetSet from './createUsingGetSet'

// TODO no more spread args here, and use consistend arg order
export default function createUsingCache<CacheKey extends any[], Value>(create: (...args: any[]) => Value) {
  const _createUsingCache = createUsingGetSet(create)
  return (cache: IArrayKeyedMap<CacheKey, Value>, key: CacheKey, ...extraArgs: any[]) => {
    return _createUsingCache(cache.get.bind(cache), cache.set.bind(cache), key, ...extraArgs)
  }
}
