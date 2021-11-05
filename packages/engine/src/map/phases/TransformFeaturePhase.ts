import { MapStateUnwrapped, FeatureKey, TaskStatus } from '../types'
import fetchUsingCache from '../functions/fetchUsingCache'
// @ts-ignore
import createWorker from '../workers/transformFeatureWorker.ts?worker'
import { WorkerApi } from '../workers/transformFeatureWorker'
import createWorkerFunction from '../functions/createWorkerFunction'

const transformFeature = createWorkerFunction<WorkerApi>(createWorker())

export const name = 'transform feature'
export const isAsyncPhase = true
export const isCachingPhase = true

const transformFeatureUsingCache = fetchUsingCache((state: MapStateUnwrapped, ...key: FeatureKey) => {
  const [layerName] = key
  const feature = state.featureCache.get(key)
  if (feature.properties.transformed) {
    console.warn('Feature being transformed more than once!')
  }
  const transformed = transformFeature(layerName, feature, state.originalCenter)
  feature.properties.transformed = true
  return transformed
})

export function getTaskKeys(state: MapStateUnwrapped) {
  return state.featureCache.keys()
}

export function getTaskStatus(state: MapStateUnwrapped, key: FeatureKey) {
  return state.transformedFeatureTasks.get(key)
}
export function setTaskStatus(state: MapStateUnwrapped, key: FeatureKey, status: TaskStatus) {
  return state.transformedFeatureTasks.set(key, status)
}

export function startTask(state: MapStateUnwrapped, key: FeatureKey) {
  return transformFeatureUsingCache(state.transformedFeatureCache, key, state)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [key] of state.transformedFeatureCache.evictLeastRecentlyUsedItems()) {
    state.transformedFeatureTasks.delete(key)
  }
}

export function reset(state: MapStateUnwrapped) {
  state.transformedFeatureTasks.clear()
  state.transformedFeatureCache.clear()
}
