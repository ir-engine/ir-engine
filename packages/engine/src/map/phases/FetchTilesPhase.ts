import { TaskStatus, TileKey } from '../types'
import { VectorTile } from '../types'
import createSurroundingTileIterator from '../functions/createSurroundingTileIterator'
import { TILE_ZOOM } from '../constants'
import fetchUsingCache from '../functions/fetchUsingCache'
import fetchVectorTile from '../functions/fetchVectorTile'
import { Store } from '../functions/createStore'

const fetchVectorTileUsingCache = fetchUsingCache<TileKey, VectorTile>(fetchVectorTile)

export const name = 'fetch tiles'
export const isAsyncPhase = true
export const isCachingPhase = true

export function getTaskKeys(store: Store) {
  return createSurroundingTileIterator(store.center, store.minimumSceneRadius, TILE_ZOOM)
}

export function getTaskStatus(store: Store, key: TileKey) {
  return store.fetchTilesTasks.get(key)
}
export function setTaskStatus(store: Store, key: TileKey, status: TaskStatus) {
  return store.fetchTilesTasks.set(key, status)
}

export function startTask(store: Store, key: TileKey) {
  return fetchVectorTileUsingCache(store.tileCache, key)
}

export function cleanup(store: Store) {
  for (const [key] of store.tileCache.evictLeastRecentlyUsedItems()) {
    store.fetchTilesTasks.delete(key)
  }
}
