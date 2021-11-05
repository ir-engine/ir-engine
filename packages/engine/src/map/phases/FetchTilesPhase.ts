import { MapStateUnwrapped, TaskStatus, TileKey } from '../types'
import { VectorTile } from '../types'
import createSurroundingTileIterator from '../functions/createSurroundingTileIterator'
import { TILE_ZOOM } from '../constants'
import fetchUsingCache from '../functions/fetchUsingCache'
import fetchVectorTile from '../functions/fetchVectorTile'

const fetchVectorTileUsingCache = fetchUsingCache<TileKey, VectorTile>(fetchVectorTile)

export const name = 'fetch tiles'
export const isAsyncPhase = true
export const isCachingPhase = true

export function getTaskKeys(state: MapStateUnwrapped) {
  return createSurroundingTileIterator(state.center, state.minimumSceneRadius, TILE_ZOOM)
}

export function getTaskStatus(state: MapStateUnwrapped, key: TileKey) {
  return state.fetchTilesTasks.get(key)
}
export function setTaskStatus(state: MapStateUnwrapped, key: TileKey, status: TaskStatus) {
  return state.fetchTilesTasks.set(key, status)
}

export function startTask(state: MapStateUnwrapped, key: TileKey) {
  return fetchVectorTileUsingCache(state.tileCache, state, key)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [key] of state.tileCache.evictLeastRecentlyUsedItems()) {
    state.fetchTilesTasks.delete(key)
  }
}

export function reset(state: MapStateUnwrapped) {
  state.fetchTilesTasks.clear()
  state.tileCache.clear()
}
