import { IParametricMap, ITuple, MapStateUnwrapped } from '../types'
import createUsingGetSet from './createUsingGetSet'

export default function createUsingCache<CacheKey extends ITuple, Value>(
  create: (state: MapStateUnwrapped, key: CacheKey, ...extraArgs: any[]) => Value
) {
  const _createUsingCache = createUsingGetSet(create)
  return (cache: IParametricMap<CacheKey, Value>, state: MapStateUnwrapped, key: CacheKey, ...extraArgs: any[]) => {
    return _createUsingCache(cache.get.bind(cache), cache.set.bind(cache), state, key, ...extraArgs)
  }
}
