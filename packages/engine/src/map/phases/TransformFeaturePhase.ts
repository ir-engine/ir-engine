import { FeatureKey, TaskStatus } from '../types'
import createUsingCache from '../functions/createUsingCache'
import { Store } from '../functions/createStore'
import transformFeature from '../functions/transformFeature'

export const name = 'transform feature'
export const isAsyncPhase = false
export const isCachingPhase = true

const transformFeatureUsingCache = createUsingCache((store: Store, ...key: FeatureKey) => {
  const [layerName] = key
  const feature = store.featureCache.get(key)
  if (feature.properties.transformed) {
    console.warn('Feature being transformed more than once!')
  }
  const transformed = transformFeature(layerName, feature, store.originalCenter)
  feature.properties.transformed = true
  return transformed
})

export function getTaskKeys(store: Store) {
  return store.featureCache.keys()
}

export function getTaskStatus(store: Store, key: FeatureKey) {
  return store.transformedFeatureTasks.get(key)
}
export function setTaskStatus(store: Store, key: FeatureKey, status: TaskStatus) {
  return store.transformedFeatureTasks.set(key, status)
}

export function execTask(store: Store, key: FeatureKey) {
  return transformFeatureUsingCache(store.transformedFeatureCache, key, store)
}

export function cleanup(store: Store) {
  for (const [key] of store.transformedFeatureCache.evictLeastRecentlyUsedItems()) {
    store.transformedFeatureTasks.delete(key)
  }
}
