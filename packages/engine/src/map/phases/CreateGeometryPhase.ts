import createGeometry from '../functions/createGeometry'
import fetchUsingCache from '../functions/fetchUsingCache'
import isIntersectCircleCircle from '../functions/isIntersectCircleCircle'
import { FeatureKey, TaskStatus, MapStateUnwrapped } from '../types'
import { multiplyArray } from '../util'

const $array2 = Array(2)

/** using fetchUsingCache since createGeometry returns a promise */
const createGeometryUsingCache = fetchUsingCache(async (state: MapStateUnwrapped, ...key: FeatureKey) => {
  const { feature, centerPoint, boundingCircleRadius } = state.transformedFeatureCache.get(key)
  const [layerName] = key
  const geometry = await createGeometry(state.geometryCache.map.getKey(key), layerName, feature)
  return {
    geometry,
    centerPoint,
    boundingCircleRadius
  }
})

export const name = 'create geometry'
export const isAsyncPhase = true
export const isCachingPhase = true

export function* getTaskKeys(state: MapStateUnwrapped) {
  const viewerPositionScaled = multiplyArray(state.viewerPosition, 1 / state.scale, $array2) as [number, number]
  for (const key of state.transformedFeatureCache.keys()) {
    const { centerPoint, boundingCircleRadius } = state.transformedFeatureCache.get(key)
    if (isIntersectCircleCircle(centerPoint, boundingCircleRadius, viewerPositionScaled, state.minimumSceneRadius)) {
      yield key
    }
  }
}

export function getTaskStatus(state: MapStateUnwrapped, key: FeatureKey) {
  return state.geometryTasks.get(key)
}

export function setTaskStatus(state: MapStateUnwrapped, key: FeatureKey, status: TaskStatus) {
  return state.geometryTasks.set(key, status)
}

export function startTask(state: MapStateUnwrapped, key: FeatureKey) {
  return createGeometryUsingCache(state.geometryCache, key, state)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [key, value] of state.geometryCache.evictLeastRecentlyUsedItems()) {
    state.geometryCache.delete(key)
    value.geometry.dispose()
  }
}

export function reset(state: MapStateUnwrapped) {
  state.geometryTasks.clear()
  state.geometryCache.clear()
}
