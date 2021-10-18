import { Store } from '../functions/createStore'
import createUsingCache from '../functions/createUsingCache'
import { createConvexMultiPolygonHelper } from '../helpers/PolygonHelpers'
import { TaskStatus, TileKey } from '../types'

export const name = 'create helpers'
export const isAsyncPhase = false
export const isCachingPhase = true

const createHelpersUsingCache = createUsingCache((store: Store, ...key: TileKey) => {
  const polygons = store.tileNavMeshCache.get(key)
  // const tileNavMesh = createPolygonHelper(polygons[0])
  const tileNavMesh = createConvexMultiPolygonHelper(polygons)
  tileNavMesh.scale.setScalar(1 / store.scale)
  return {
    tileNavMesh
  }
})

export function getTaskKeys(store: Store) {
  return store.tileNavMeshCache.keys()
}

export function getTaskStatus(store: Store, key: TileKey) {
  return store.helpersTasks.get(key)
}
export function setTaskStatus(store: Store, key: TileKey, status: TaskStatus) {
  return store.tileNavMeshTasks.set(key, status)
}

export function execTask(store: Store, key: TileKey) {
  return createHelpersUsingCache(store.helpersCache, key, store)
}

export function cleanup(store: Store) {
  for (const [key, value] of store.helpersCache.evictLeastRecentlyUsedItems()) {
    store.helpersTasks.delete(key)
    value.tileNavMesh.geometry.dispose()
  }
}
