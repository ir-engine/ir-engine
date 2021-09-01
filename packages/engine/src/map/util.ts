import { ILayerName, TileFeaturesByLayer } from './types'
import { Feature, Position } from 'geojson'
import { Vector3 } from 'three'

export function collectFeaturesByLayer(layerName: ILayerName, vectorTiles: TileFeaturesByLayer[]): Feature[] {
  return vectorTiles.reduce((accFeatures, tile) => {
    return [...accFeatures, ...tile[layerName]]
  }, [])
}

export function vector3ToPosition(vector: Vector3): Position {
  return [vector.x, vector.z]
}
