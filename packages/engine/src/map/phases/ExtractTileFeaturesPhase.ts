import { TaskStatus, TileKey, VectorTile } from '../types'
import { SUPPORTED_LAYERS, TILE_ZOOM } from '../constants'
import zipIndexes from '../zipIndexes'
import getFeaturesFromVectorTileLayer from '../functions/getFeaturesFromVectorTileLayer'
import { Store } from '../functions/createStore'

export const name = 'extract tile features'
export const isAsyncPhase = false
export const isCachingPhase = true

export function getTaskKeys(store: Store) {
  return store.tileCache.keys()
}

export function getTaskStatus(store: Store, key: TileKey) {
  return store.extractTilesTasks.get(key)
}
export function setTaskStatus(store: Store, key: TileKey, status: TaskStatus) {
  return store.extractTilesTasks.set(key, status)
}

export function execTask(store: Store, key: TileKey) {
  const vectorTile = store.tileCache.get(key)
  const [x, y] = key
  if (vectorTile) {
    for (const layerName of SUPPORTED_LAYERS) {
      const layer = vectorTile.layers[layerName]

      if (!layer) continue

      for (const [index, feature] of zipIndexes(
        getFeaturesFromVectorTileLayer(layerName, vectorTile, x, y, TILE_ZOOM)
      )) {
        const featureKey = [layerName, x, y, `${index}`]
        store.featureCache.set(featureKey, feature)
      }
    }
  }
}

export function cleanup(store: Store) {
  store.featureCache.evictLeastRecentlyUsedItems()
  // TODO
  // for(const [key, value] of store.featureCache.evictLeastRecentlyUsedItems()) {
  //   const count = store.featureMeta.get(key).perTileCount--
  //   if(count === 1) {
  //     const tileKey = store.featureMeta.get(key).tileKey
  //     store.extractTilesTasks.delete(tileKey)
  //   }
  // }
}
