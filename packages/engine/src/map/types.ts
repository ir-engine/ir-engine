import { Feature } from 'geojson'
import { BufferGeometry, InstancedBufferGeometry, Mesh, Object3D } from 'three'
import { LongLat } from './units'

/**
 * @fileoverview a place for all types that are shared by multiple modules but not conceptually owned by any
 */

export interface VectorTile {
  /** There are more, these are the only ones we care about for now. */
  layers: {
    building: VectorTileLayer
    road: VectorTileLayer
    water: VectorTileLayer
    waterway: VectorTileLayer
    landuse: VectorTileLayer
  }
  feature(index: number): RawFeature
}

export interface VectorTileLayer {
  length: number
}

export interface RawFeature {
  toGeoJSON(x: number, y: number, zoom: number): Feature
}

export type ILayerName = keyof VectorTile['layers']

export interface FeatureWithTileIndex extends Feature {
  properties: {
    /** index of feature within tile */
    tileIndex: string
    [key: string]: any
  }
}

export interface Text3D extends Mesh {
  sync(): void
  update(): void
  dispose(): void
}

export interface MapDerivedFeatureGeometry {
  geometry: BufferGeometry | InstancedBufferGeometry
  centerPoint: [number, number]
  boundingCircleRadius: number
}

export interface MapDerivedFeatureComplete {
  mesh: Mesh
  centerPoint: [number, number]
  boundingCircleRadius: number
}

export interface MapFeatureLabel {
  mesh: Text3D
  centerPoint: [number, number]
  boundingCircleRadius: number
}

export type TileKey = [number, number]
export type FeatureKey = [ILayerName, number, number, string]

export interface IArrayKeyedMap<Key extends any[], Value> {
  set(keySource: Key, value: Value): IArrayKeyedMap<Key, Value>

  get(key: Key): Value

  delete(key: Key): boolean

  keys(): Iterable<Key>
}
