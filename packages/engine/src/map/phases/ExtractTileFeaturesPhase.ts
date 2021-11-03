import { MapStateUnwrapped, FeatureKey, SupportedFeature, TaskStatus, TileKey, VectorTile } from '../types'
import { SUPPORTED_LAYERS, SUPPORTED_GEOMETRIES, TILE_ZOOM } from '../constants'
import zipIndexes from '../zipIndexes'
import getFeaturesFromVectorTileLayer from '../functions/getFeaturesFromVectorTileLayer'
import stringifyArray from '../functions/stringifyArray'

export const name = 'extract tile features'
export const isAsyncPhase = false
export const isCachingPhase = true

export function getTaskKeys(state: MapStateUnwrapped) {
  console.log('tileCache size', state.tileCache.hash.map.size)
  return state.tileCache.keys()
}

export function getTaskStatus(state: MapStateUnwrapped, keyHash: string) {
  return state.extractTilesTasks.get(keyHash)
}
export function setTaskStatus(state: MapStateUnwrapped, keyHash: string, status: TaskStatus) {
  return state.extractTilesTasks.set(keyHash, status)
}

export function execTask(state: MapStateUnwrapped, tileKey: TileKey) {
  const vectorTile = state.tileCache.get(tileKey)
  const [x, y] = tileKey
  if (vectorTile) {
    for (const layerName of SUPPORTED_LAYERS) {
      const layer = vectorTile.layers[layerName]

      if (!layer) continue

      for (const [index, feature] of zipIndexes(
        getFeaturesFromVectorTileLayer(layerName, vectorTile, x, y, TILE_ZOOM)
      )) {
        if (SUPPORTED_GEOMETRIES.includes(feature.geometry.type)) {
          const tileKeyHash = stringifyArray(tileKey)
          const featureKey = [layerName, x, y, `${index}`] as FeatureKey
          const featureKeyHash = stringifyArray(featureKey)
          state.featureCache.set(featureKey, feature as SupportedFeature)
          state.featureMeta.set(featureKeyHash, { tileKeyHash })
          state.tileMeta.get(tileKeyHash).cachedFeatureKeyHashes.add(featureKeyHash)
        }
      }
    }
  }
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [featureKey] of state.featureCache.evictLeastRecentlyUsedItems()) {
    const { tileKeyHash } = state.featureMeta.get(featureKey)
    const { cachedFeatureKeyHashes } = state.tileMeta.get(tileKeyHash)
    cachedFeatureKeyHashes.delete(featureKey)
    if (cachedFeatureKeyHashes.size === 0) {
      state.extractTilesTasks.delete(tileKeyHash)
      state.tileCache.delete(tileKeyHash)
      state.tileMeta.delete(tileKeyHash)
    }
  }
}

export function reset(state: MapStateUnwrapped) {
  state.extractTilesTasks.clear()
  state.tileMeta.clear()
  state.featureCache.clear()
  state.featureMeta.clear()
}
