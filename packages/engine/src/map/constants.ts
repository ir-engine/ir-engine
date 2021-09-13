import { ILayerName } from './types'

export const SUPPORTED_LAYERS: readonly ILayerName[] = Object.freeze([
  'building',
  'road',
  'water',
  'waterway',
  'landuse'
])
export const TILE_ZOOM = 16
