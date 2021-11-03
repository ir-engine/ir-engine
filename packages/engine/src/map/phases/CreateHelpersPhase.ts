import createUsingCache from '../functions/createUsingCache'
import { createConvexMultiPolygonHelper } from '../helpers/PolygonHelpers'
import { TaskStatus, TileKey, MapStateUnwrapped } from '../types'

export const name = 'create helpers'
export const isAsyncPhase = false
export const isCachingPhase = true

const createHelpersUsingCache = createUsingCache((state: MapStateUnwrapped, ...key: TileKey) => {
  const polygons = state.tileNavMeshCache.get(key)
  // const tileNavMesh = createPolygonHelper(polygons[0])
  const tileNavMesh = createConvexMultiPolygonHelper(polygons)
  tileNavMesh.scale.setScalar(1 / state.scale)
  return {
    tileNavMesh
  }
})

export function getTaskKeys(state: MapStateUnwrapped) {
  return state.tileNavMeshCache.keys()
}

export function getTaskStatus(state: MapStateUnwrapped, keyHash: string) {
  return state.helpersTasks.get(keyHash)
}
export function setTaskStatus(state: MapStateUnwrapped, keyHash: string, status: TaskStatus) {
  return state.tileNavMeshTasks.set(keyHash, status)
}

export function execTask(state: MapStateUnwrapped, key: TileKey) {
  return createHelpersUsingCache(state.helpersCache, key, state)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [key, value] of state.helpersCache.evictLeastRecentlyUsedItems()) {
    state.helpersTasks.delete(key)
    value.tileNavMesh.geometry.dispose()
  }
}

export function reset(state: MapStateUnwrapped) {
  state.helpersTasks.clear()
  state.helpersCache.clear()
}
