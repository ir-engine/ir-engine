import createGeometry from '../functions/createGeometry'
import { MAX_CACHED_FEATURES, Store } from '../functions/createStore'
import fetchUsingCache from '../functions/fetchUsingCache'
import { FeatureKey, TaskStatus } from '../types'

/** using fetchUsingCache since createGeometry returns a promise */
const createGeometryUsingCache = fetchUsingCache((store: Store, ...key: FeatureKey) => {
  const feature = store.featureCache.get(key)
  const [layerName] = key
  return createGeometry(store.geometryCache.map.getKey(key), layerName, feature, store.originalCenter)
})

export const name = 'create geometry'
export const isAsyncPhase = true
export const isCachingPhase = true

export function* getTaskKeys(store: Store) {
  let count = 0
  for (const key of store.featureCache.keys()) {
    const feature = store.featureCache.get(key)
    if (feature.geometry.type !== 'Point') {
      yield key
      // TODO why does this for loop not end on its own??
      if (count > MAX_CACHED_FEATURES) break
      count++
    }
  }
}

export function getTaskStatus(store: Store, key: FeatureKey) {
  return store.geometryTasks.get(key)
}

export function setTaskStatus(store: Store, key: FeatureKey, status: TaskStatus) {
  return store.geometryTasks.set(key, status)
}

export function startTask(store: Store, key: FeatureKey) {
  return createGeometryUsingCache(store.geometryCache, key, store)
}

export function cleanup(store: Store) {
  for (const [key, value] of store.geometryCache.evictLeastRecentlyUsedItems()) {
    store.geometryCache.delete(key)
    value.geometry.dispose()
  }
}
