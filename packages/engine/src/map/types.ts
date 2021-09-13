import { Feature } from 'geojson'
import { BufferGeometry, InstancedBufferGeometry, Mesh } from 'three'
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

export interface FeatureWithTileIndex extends Feature {
  properties: {
    /** index of feature within tile */
    tileIndex: string
    [key: string]: any
  }
}

export interface MapDerivedFeatureGeometry {
  geometry: BufferGeometry | InstancedBufferGeometry
  geographicCenterPoint: LongLat
}

export interface MapDerivedFeatureComplete {
  mesh: Mesh
  geographicCenterPoint: LongLat
  // TODO add label
}
