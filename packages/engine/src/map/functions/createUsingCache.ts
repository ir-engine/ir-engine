import { IArrayKeyedMap } from '../types'
import createUsingGetSet from './createUsingGetSet'

export default function createUsingCache<CacheKey extends any[], Value>(create: (...args: CacheKey) => Value) {
  const _createUsingCache = createUsingGetSet(create)
  return (cache: IArrayKeyedMap<CacheKey, Value>, createArgs: CacheKey) => {
    return _createUsingCache(cache.get.bind(cache), cache.set.bind(cache), createArgs)
  }
}
