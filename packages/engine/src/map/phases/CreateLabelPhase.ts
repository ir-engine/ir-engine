import { Feature, LineString } from 'geojson'
import { FeatureKey, TaskStatus, MapStateUnwrapped } from '../types'
import createUsingCache from '../functions/createUsingCache'
import createFeatureLabel from '../functions/createFeatureLabel'

export const name = 'CreateLabel'
export const isAsyncPhase = false
export const isCachingPhase = true

export function* getTaskKeys(state: MapStateUnwrapped) {
  for (const key of state.completeObjects.keys()) {
    const feature = state.featureCache.get(key)
    const transformed = state.transformedFeatureCache.get(key)
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

export function getTaskStatus(state: MapStateUnwrapped, key: FeatureKey) {
  return state.labelTasks.get(key)
}
export function setTaskStatus(state: MapStateUnwrapped, key: FeatureKey, status: TaskStatus) {
  return state.labelTasks.set(key, status)
}

const createLabelUsingCache = createUsingCache((state: MapStateUnwrapped, key: FeatureKey) => {
  const feature = state.featureCache.get(key)
  const label = createFeatureLabel(feature.properties.name, feature as Feature<LineString>, state.originalCenter)
  label.mesh.update()
  return label
})

export function execTask(state: MapStateUnwrapped, key: FeatureKey) {
  return createLabelUsingCache(state.labelCache, state, key)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [key, value] of state.labelCache.evictLeastRecentlyUsedItems()) {
    state.labelCache.delete(key)
    value.mesh.dispose()
  }
}

export function reset(state: MapStateUnwrapped) {
  state.labelTasks.clear()
  state.labelCache.clear()
}
