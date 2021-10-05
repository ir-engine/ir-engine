import { Feature, LineString, MultiLineString } from 'geojson'
import { FeatureKey, TaskStatus } from '../types'
import createUsingCache from '../functions/createUsingCache'
import createFeatureLabel from '../functions/createFeatureLabel'
import { Store } from '../functions/createStore'

export const name = 'create label'
export const isAsyncPhase = false
export const isCachingPhase = true

export function* getTaskKeys(store: Store) {
  for (const key of store.completeObjects.keys()) {
    const feature = store.featureCache.get(key)
    const transformed = store.transformedFeatureCache.get(key)
    if (
      key[0] === 'road' &&
      transformed &&
      feature &&
      feature.geometry.type === 'LineString' &&
      transformed.feature.properties.name
    ) {
      yield key
    }
  }
}

export function getTaskStatus(store: Store, key: FeatureKey) {
  return store.labelTasks.get(key)
}
export function setTaskStatus(store: Store, key: FeatureKey, status: TaskStatus) {
  return store.labelTasks.set(key, status)
}

const createLabelUsingCache = createUsingCache((store: Store, ...key: FeatureKey) => {
  const feature = store.featureCache.get(key)
  const label = createFeatureLabel(feature.properties.name, feature as Feature<LineString>, store.originalCenter)
  label.mesh.update()
  return label
})

export function execTask(store: Store, key: FeatureKey) {
  return createLabelUsingCache(store.labelCache, key, store)
}

export function cleanup(store: Store) {
  for (const [key, value] of store.labelCache.evictLeastRecentlyUsedItems()) {
    store.labelCache.delete(key)
    value.mesh.dispose()
  }
}
