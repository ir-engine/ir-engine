import { VectorTile } from '@mapbox/vector-tile'
import { SUPPORTED_LAYERS } from '../constants'
import { addTileIndex, unifyFeatures } from '../GeoJSONFns'
import { FeatureWithTileIndex } from '../types'
import { LongLat } from '../units'
import createObjects from './createObjects'

export function getFeaturesFromVectorLayer(
  layerName: string,
  layer,
  x: number,
  y: number,
  zoom: number
): FeatureWithTileIndex[] {
  const features: FeatureWithTileIndex[] = []
  for (let i = 0; i < layer.length; i++) {
    features.push(layer.feature(i).toGeoJSON(x, y, zoom))
  }
  addTileIndex(features)
  if (layerName === 'building') {
    return unifyFeatures(features, { tileIndex: true }) as any
  } else {
    return features as any
  }
}

export default async function* createObjectsFromVectorTile(
  tile: VectorTile,
  x: number,
  y: number,
  zoom: number,
  center: LongLat
) {
  for (const layerName of SUPPORTED_LAYERS) {
    const layer = tile.layers[layerName]

    if (!layer) continue

    const features = getFeaturesFromVectorLayer(layerName, layer, x, y, zoom)

    for await (const object of createObjects(layerName as any, x, y, features, center)) {
      yield object
    }
  }
}
