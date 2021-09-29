import createGeometry from '../functions/createGeometry'
import { MAX_CACHED_FEATURES, Store } from '../functions/createStore'
import fetchUsingCache from '../functions/fetchUsingCache'
import isIntersectCircleCircle from '../functions/isIntersectCircleCircle'
import { FeatureKey, TaskStatus } from '../types'
import { multiplyArray } from '../util'

const $array2 = Array(2)

/** using fetchUsingCache since createGeometry returns a promise */
const createGeometryUsingCache = fetchUsingCache(async (store: Store, ...key: FeatureKey) => {
  const { feature, centerPoint, boundingCircleRadius } = store.transformedFeatureCache.get(key)
  const [layerName] = key
  const geometry = await createGeometry(store.geometryCache.map.getKey(key), layerName, feature)
  return {
    geometry,
    centerPoint,
    boundingCircleRadius
  }
})

export const name = 'create geometry'
export const isAsyncPhase = true
export const isCachingPhase = true

export function* getTaskKeys(store: Store) {
  const viewerPositionScaled = multiplyArray(store.viewerPosition, 1 / store.scale, $array2) as [number, number]
  for (const key of store.transformedFeatureCache.keys()) {
    const { centerPoint, boundingCircleRadius } = store.transformedFeatureCache.get(key)
    if (isIntersectCircleCircle(centerPoint, boundingCircleRadius, viewerPositionScaled, store.minimumSceneRadius)) {
      yield key
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
