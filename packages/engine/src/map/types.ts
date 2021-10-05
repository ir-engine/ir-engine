import { Feature, LineString, MultiLineString, MultiPolygon, Polygon } from 'geojson'
import { BufferGeometry, InstancedBufferGeometry, Mesh } from 'three'
import { Store } from './functions/createStore'

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

export type ILayerName = keyof VectorTile['layers'] | 'landuse_fallback'

export interface FeatureWithTileIndex extends Feature {
  properties: {
    /** index of feature within tile */
    tileIndex: string
    [key: string]: any
  }
}

export interface Text3D extends Mesh {
  fontSize: number
  sync(): void
  update(): void
  dispose(): void
}

export interface SupportedFeature extends Feature<LineString | MultiLineString | Polygon | MultiPolygon> {
  properties: {
    [key: string]: any
  }
}

export interface MapTransformedFeature {
  feature: SupportedFeature
  centerPoint: [number, number]
  boundingCircleRadius: number
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

export interface MapHelpers {
  tileNavMesh: Mesh
}

export type TileKey = [number, number]
export type FeatureKey = [ILayerName, number, number, string]

export interface IArrayKeyedMap<Key extends any[], Value> {
  set(keySource: Key, value: Value): IArrayKeyedMap<Key, Value>

  get(key: Key): Value

  delete(key: Key): boolean

  keys(): Iterable<Key>
}

export enum TaskStatus {
  NOT_STARTED = 0,
  STARTED = 1
}

export interface ISyncPhase<TaskKey, TaskResult> {
  name: string
  isCachingPhase: false
  isAsyncPhase: false
  getTaskKeys(store: Store): Iterable<TaskKey>
  execTask(store: Store, key: TaskKey): TaskResult
  cleanup(store: Store): void
}
export interface ICachingPhase<TaskKey, TaskResult> {
  name: string
  isCachingPhase: true
  isAsyncPhase: false
  getTaskStatus(store: Store, key: TaskKey): TaskStatus
  setTaskStatus(store: Store, key: TaskKey, status: TaskStatus): void
  getTaskKeys(store: Store): Iterable<TaskKey>
  execTask(store: Store, key: TaskKey): TaskResult
  cleanup(store: Store): void
}
export interface IAsyncPhase<TaskKey, TaskResult> {
  name: string
  isCachingPhase: true
  isAsyncPhase: true
  getTaskStatus(store: Store, key: TaskKey): TaskStatus
  setTaskStatus(store: Store, key: TaskKey, status: TaskStatus): void
  getTaskKeys(store: Store): Iterable<TaskKey>
  startTask(store: Store, key: TaskKey): Promise<TaskResult>
  cleanup(store: Store): void
}

export type IPhase<TaskKey, TaskResult> =
  | ISyncPhase<TaskKey, TaskResult>
  | ICachingPhase<TaskKey, TaskResult>
  | IAsyncPhase<TaskKey, TaskResult>
