import { Feature } from 'geojson'
import Task from './Task'
import { VectorTile } from '../types'
import FeatureCache from './FeatureCache'
import TileCache from './TileCache'
import { SUPPORTED_LAYERS, TILE_ZOOM } from '../constants'
import getFeaturesFromVectorTileLayer from '../functions/getFeaturesFromVectorTileLayer'
import zipIndexes from '../zipIndexes'

export default class ExtractTileFeaturesTask extends Task<void> {
  tileCache: TileCache<VectorTile>
  featureCache: FeatureCache<Feature>
  x: number
  y: number
  constructor(tileCache: TileCache<VectorTile>, featureCache: FeatureCache<Feature>, x: number, y: number) {
    super()
    this.tileCache = tileCache
    this.featureCache = featureCache
    this.x = x
    this.y = y
  }

  exec() {
    const vectorTile = this.tileCache.get([this.x, this.y])
    if (vectorTile) {
      for (const layerName of SUPPORTED_LAYERS) {
        const layer = vectorTile.layers[layerName]

        if (!layer) continue

        // TODO how to handle navMesh?
        for (const [index, feature] of zipIndexes(
          getFeaturesFromVectorTileLayer(layerName, vectorTile, this.x, this.y, TILE_ZOOM)
        )) {
          this.featureCache.set([layerName, this.x, this.y, `${index}`], feature)
        }
      }
    }
  }
}
