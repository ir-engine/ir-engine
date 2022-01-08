import createCompleteObject from '../functions/createCompleteObject'
import createUsingCache from '../functions/createUsingCache'
import { FeatureKey, MapStateUnwrapped, TaskStatus } from '../types'

export const name = 'CreateCompleteObject'
export const isAsyncPhase = false
export const isCachingPhase = true

const createCompleteObjectUsingCache = createUsingCache((state: MapStateUnwrapped, key: FeatureKey) => {
  const [layerName] = key

  const feature = state.featureCache.get(key)
  const geometry = state.geometryCache.get(key)
  const retval = createCompleteObject(layerName, geometry, feature)
  return retval
})

export function* getTaskKeys(state: MapStateUnwrapped) {
  for (const key of state.featureCache.keys()) {
    const geometry = state.geometryCache.get(key)
    if (geometry) {
      yield key
    }
  }
}

export function getTaskStatus(state: MapStateUnwrapped, key: FeatureKey) {
  return state.completeObjectsTasks.get(key)
}
export function setTaskStatus(state: MapStateUnwrapped, key: FeatureKey, status: TaskStatus) {
  return state.completeObjectsTasks.set(key, status)
}

export function execTask(state: MapStateUnwrapped, key: FeatureKey) {
  return createCompleteObjectUsingCache(state.completeObjects, state, key)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [key, value] of state.completeObjects.evictLeastRecentlyUsedItems()) {
    state.completeObjectsTasks.delete(key)
    value.mesh.geometry.dispose()
  }
}

export function reset(state: MapStateUnwrapped) {
  state.completeObjectsTasks.clear()
  state.completeObjects.clear()
}
