import { ILayerName, TileFeaturesByLayer } from './types'
import { Feature, Position } from 'geojson'
import { Vector3 } from 'three'

export function collectFeaturesByLayer(layerName: ILayerName, vectorTiles: TileFeaturesByLayer[]): Feature[] {
  return vectorTiles.reduce((accFeatures, tile) => {
    return [...accFeatures, ...tile[layerName]]
  }, [])
}

export function vector3ToArray2(vector: Vector3): [number, number] {
  return [vector.x, vector.z]
}
