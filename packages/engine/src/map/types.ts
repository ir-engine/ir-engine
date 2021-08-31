import { Feature } from 'geojson'

export interface TileFeaturesByLayer {
  building: Feature[]
  road: Feature[]
  water: Feature[]
  waterway: Feature[]
  landuse: Feature[]
}
export type ILayerName = keyof TileFeaturesByLayer

/** Memnonic drop-in replacement for geojson.Position */
export type LongLat = number[]
