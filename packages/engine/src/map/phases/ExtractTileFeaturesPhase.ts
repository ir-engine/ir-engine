import FeatureKey from '../classes/FeatureKey'
import { SUPPORTED_GEOMETRIES, SUPPORTED_LAYERS, TILE_ZOOM } from '../constants'
import getFeaturesFromVectorTileLayer from '../functions/getFeaturesFromVectorTileLayer'
import { MapStateUnwrapped, SupportedFeature, TaskStatus, TileKey } from '../types'
import zipIndexes from '../zipIndexes'

export const name = 'ExtractTileFeatures'
export const isAsyncPhase = false
export const isCachingPhase = true

export function getTaskKeys(state: MapStateUnwrapped) {
  console.log('tileCache size', state.tileCache.size)
  return state.tileCache.keys()
}

export function getTaskStatus(state: MapStateUnwrapped, key: TileKey) {
  return state.extractTilesTasks.get(key)
}
export function setTaskStatus(state: MapStateUnwrapped, key: TileKey, status: TaskStatus) {
  return state.extractTilesTasks.set(key, status)
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
          const featureKey = new FeatureKey(layerName, x, y, `${index}`)
          state.featureCache.set(featureKey, feature as SupportedFeature)
          state.featureMeta.set(featureKey, { tileKey: tileKey })
          state.tileMeta.get(tileKey).cachedFeatureKeys.add(featureKey)
        }
      }
    }
  }
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [featureKey] of state.featureCache.evictLeastRecentlyUsedItems()) {
    const { tileKey } = state.featureMeta.get(featureKey)
    const { cachedFeatureKeys } = state.tileMeta.get(tileKey)
    cachedFeatureKeys.delete(featureKey)
    if (cachedFeatureKeys.size === 0) {
      state.extractTilesTasks.delete(tileKey)
      state.tileCache.delete(tileKey)
      state.tileMeta.delete(tileKey)
    }
  }
}

export function reset(state: MapStateUnwrapped) {
  state.extractTilesTasks.clear()
  state.tileMeta.clear()
  state.featureCache.clear()
  state.featureMeta.clear()
}
