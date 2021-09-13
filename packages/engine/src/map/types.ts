import { Feature } from 'geojson'
import { Mesh } from 'three'
import { LongLat } from './units'

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

export interface Map3DObject {
  uuid: string
  mesh: Mesh
  geographicCenterPoint: LongLat
}

export interface FeatureWithTileIndex extends Feature {
  properties: {
    /** index of feature within tile */
    tileIndex: string
    [key: string]: any
  }
}
