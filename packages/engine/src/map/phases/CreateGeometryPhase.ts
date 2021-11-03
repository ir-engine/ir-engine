import createWorkerFunction from '../functions/createWorkerFunction'
import fetchUsingCache from '../functions/fetchUsingCache'
import isIntersectCircleCircle from '../functions/isIntersectCircleCircle'
import { FeatureKey, TaskStatus, MapStateUnwrapped } from '../types'
import { multiplyArray } from '../util'
// @ts-ignore
import createGeometryWorker from '../workers/geometryWorker.ts?worker'
import { WorkerApi } from '../workers/geometryWorker'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from '../styles'
import { BufferGeometryLoader } from 'three'
import { getHumanFriendlyFeatureKey } from '../helpers/KeyHelpers'

const $array2 = Array(2)

const createGeometry = createWorkerFunction<WorkerApi>(createGeometryWorker())

const geometryLoader = new BufferGeometryLoader()

/** using fetchUsingCache since createGeometry returns a promise */
const createGeometryUsingCache = fetchUsingCache(async (state: MapStateUnwrapped, ...key: FeatureKey) => {
  const { feature, centerPoint, boundingCircleRadius } = state.transformedFeatureCache.get(key)
  const [layerName] = key
  const styles = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)
  const result = await createGeometry(feature, styles)

  if (result === null) {
    console.warn('Encountered an error while creating geometry.', getHumanFriendlyFeatureKey(key))
  }

  const {
    geometry: { json }
  } = result!

  // Reconstitute the serialized geometry
  const geometry = geometryLoader.parse(json)
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

export function getTaskStatus(state: MapStateUnwrapped, keyHash: string) {
  return state.geometryTasks.get(keyHash)
}

export function setTaskStatus(state: MapStateUnwrapped, keyHash: string, status: TaskStatus) {
  return state.geometryTasks.set(keyHash, status)
}

export function startTask(state: MapStateUnwrapped, key: FeatureKey) {
  return createGeometryUsingCache(state.geometryCache, key, state)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [keyHash, value] of state.geometryCache.evictLeastRecentlyUsedItems()) {
    state.geometryCache.delete(keyHash)
    value.geometry.dispose()
  }
}

export function reset(state: MapStateUnwrapped) {
  state.geometryTasks.clear()
  state.geometryCache.clear()
}
