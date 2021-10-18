import { FeatureKey, SupportedFeature, TaskStatus, TileKey, VectorTile } from '../types'
import { SUPPORTED_LAYERS, SUPPORTED_GEOMETRIES, TILE_ZOOM } from '../constants'
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
        if (SUPPORTED_GEOMETRIES.includes(feature.geometry.type)) {
          const featureKey = [layerName, x, y, `${index}`] as FeatureKey
          store.featureCache.set(featureKey, feature as SupportedFeature)
          store.featureMeta.set(featureKey, { tileKey: key })
          store.tileMeta.get(key).cachedFeatureKeys.add(featureKey)
        }
      }
    }
  }
}

export function cleanup(store: Store) {
  for (const [featureKey] of store.featureCache.evictLeastRecentlyUsedItems()) {
    const { tileKey } = store.featureMeta.get(featureKey)
    const { cachedFeatureKeys } = store.tileMeta.get(tileKey)
    cachedFeatureKeys.delete(featureKey)
    if (cachedFeatureKeys.size === 0) {
      store.extractTilesTasks.delete(tileKey)
      store.tileCache.delete(tileKey)
      store.tileMeta.delete(tileKey)
    }
  }
}
