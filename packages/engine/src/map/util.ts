import { ILayerName, TileFeaturesByLayer } from './types'
import { Feature } from 'geojson'

export function collectFeaturesByLayer(layerName: ILayerName, vectorTiles: TileFeaturesByLayer[]): Feature[] {
  return vectorTiles.reduce((accFeatures, tile) => {
    return [...accFeatures, ...tile[layerName]]
  }, [])
}
