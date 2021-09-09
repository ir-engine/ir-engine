import { Feature } from 'geojson'

/**
 * @fileoverview a place for all types that are shared by multiple modules but not conceptually owned by any
 */

export interface TileFeaturesByLayer {
  building: Feature[]
  road: Feature[]
  water: Feature[]
  waterway: Feature[]
  landuse: Feature[]
}
export type ILayerName = keyof TileFeaturesByLayer
