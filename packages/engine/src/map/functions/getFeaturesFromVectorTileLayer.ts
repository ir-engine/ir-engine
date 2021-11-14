import { VectorTile } from '../types'
import { FeatureWithTileIndex } from '../types'

export default function* getFeaturesFromVectorTileLayer(
  layerName: string,
  tile: VectorTile,
  x: number,
  y: number,
  zoom: number
): Generator<FeatureWithTileIndex> {
  const layer = tile.layers[layerName]
  for (let tileIndex = 0; tileIndex < layer.length; tileIndex++) {
    const feature = layer.feature(tileIndex).toGeoJSON(x, y, zoom)
    // feature.properties.tileIndex = `${tileIndex}`
    yield feature as FeatureWithTileIndex
  }
}
