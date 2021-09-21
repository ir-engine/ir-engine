import { ILayerName } from './types'

export const SUPPORTED_LAYERS: readonly ILayerName[] = Object.freeze([
  'landuse',
  'water',
  'waterway',
  'road',
  'building'
])
export const TILE_ZOOM = 16
