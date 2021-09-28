import { FeatureKey, TaskStatus } from '../types'
import createUsingCache from '../functions/createUsingCache'
import createCompleteObject from '../functions/createCompleteObject'
import { Store } from '../functions/createStore'

export const name = 'create complete object'
export const isAsyncPhase = false
export const isCachingPhase = true

const createCompleteObjectUsingCache = createUsingCache((store: Store, ...key: FeatureKey) => {
  const [layerName] = key

  const feature = store.featureCache.get(key)
  const geometry = store.geometryCache.get(key)
  return createCompleteObject(layerName, geometry, feature)
})

export function* getTaskKeys(store: Store) {
  for (const key of store.featureCache.keys()) {
    const geometry = store.geometryCache.get(key)
    if (geometry) {
      yield key
    }
  }
}

export function getTaskStatus(store: Store, key: FeatureKey) {
  return store.completeObjectsTasks.get(key)
}
export function setTaskStatus(store: Store, key: FeatureKey, status: TaskStatus) {
  return store.completeObjectsTasks.set(key, status)
}

export function execTask(store: Store, key: FeatureKey) {
  return createCompleteObjectUsingCache(store.completeObjects, key, store)
}

export function cleanup(store: Store) {
  for (const [key, value] of store.completeObjects.evictLeastRecentlyUsedItems()) {
    store.completeObjectsTasks.delete(key)
    value.mesh.geometry.dispose()
  }
}
