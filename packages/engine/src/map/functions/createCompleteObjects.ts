import { Feature } from 'geojson'
import FeatureCache from '../classes/FeatureCache'
import { MapDerivedFeatureComplete, MapDerivedFeatureGeometry } from '../types'

export function createCompleteObjectUsingCache(
  cache: FeatureCache<MapDerivedFeatureComplete>,
  layerName: string,
  x: number,
  y: number,
  tileIndex: string,
  geometry: MapDerivedFeatureGeometry,
  feature: Feature
): MapDerivedFeatureComplete {
  return null as any
}
