import { Geometry } from 'geojson'
import { ILayerName } from './types'

export const SUPPORTED_LAYERS: readonly ILayerName[] = Object.freeze([
  'landuse',
  'water',
  'waterway',
  'road',
  'building'
])

export const SUPPORTED_GEOMETRIES: readonly Geometry['type'][] = Object.freeze([
  'Polygon',
  'MultiPolygon',
  'LineString',
  'MultiLineString'
])
export const TILE_ZOOM = 16
