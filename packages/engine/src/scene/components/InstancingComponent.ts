import { BufferGeometry, Color, Material, MathUtils, Mesh, Texture } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export enum SampleMode {
  SCATTER,
  VERTICES,
  NODES
}

export enum ScatterMode {
  GRASS,
  MESH
}

export enum ScatterState {
  UNSTAGED,
  STAGING,
  STAGED,
  SCATTERING,
  SCATTERED
}

export type RandomizedProperty = { mu: number; sigma: number }
export type NormalizedProperty = number

export function sample(prop: RandomizedProperty) {
  //simple
  return prop.mu + sampleVar(prop)
}

export function sampleVar(prop: RandomizedProperty) {
  return (Math.random() * 2 - 1) * prop.sigma
}

export type GrassProperties = {
  isGrassProperties: true
  bladeHeight: RandomizedProperty
  bladeWidth: RandomizedProperty
  joints: number
  grassTexture: Texture | string
  alphaMap: Texture | string
  ////lighting properties
  ambientStrength: number
  diffuseStrength: number
  shininess: number
  sunColor: Color
}

export type MeshProperties = {
  isMeshProperties: true
  instancedMesh: any
}

type DensityMapped = {
  densityMap: Texture | string
  densityMapStrength: NormalizedProperty
}

type HeightMapped = {
  heightMap: Texture | string
  heightMapStrength: NormalizedProperty
}

export type ScatterProperties = {
  isScatterProperties: true
} & DensityMapped &
  HeightMapped

export type VertexProperties = {
  isVertexProperties: true
  vertexColors: boolean
} & DensityMapped &
  HeightMapped

export type NodeProperties = {
  isNodeProperties: true
  root: any
}

export type SampleProperties = ScatterProperties & VertexProperties & NodeProperties
export type SourceProperties = GrassProperties & MeshProperties

export type InstancingComponentType = {
  count: number
  surface: string
  sampling: SampleMode
  mode: ScatterMode
  state: ScatterState
  sampleProperties: ScatterProperties | VertexProperties | NodeProperties
  sourceProperties: GrassProperties | MeshProperties
}

export const InstancingComponent = createMappedComponent<InstancingComponentType>('InstancingComponent')

export const InstancingStagingComponent = createMappedComponent('InstancingStagingComponent')

export const InstancingUnstagingComponent = createMappedComponent('InstancingUnstagingComponent')
