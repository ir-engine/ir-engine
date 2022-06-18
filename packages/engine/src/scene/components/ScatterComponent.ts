import { BufferGeometry, Color, Material, MathUtils, Mesh, Texture } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

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
  heightMap: Texture | string
  heightMapStrength: NormalizedProperty
  densityMap: Texture | string
  densityMapStrength: NormalizedProperty
  ////lighting properties
  ambientStrength: number
  diffuseStrength: number
  shininess: number
  sunColour: Color
}

export type MeshProperties = {
  isMeshProperties: true
  instancedMesh: any
}

export type ScatterComponentType = {
  count: number
  surface: any
  densityMap: string
  mode: ScatterMode
  state: ScatterState
  properties: GrassProperties | MeshProperties
}

export const ScatterComponent = createMappedComponent<ScatterComponentType>('ScatterComponent')

export const ScatterStagingComponent = createMappedComponent('ScatterStagingComponent')

export const ScatterUnstagingComponent = createMappedComponent('ScatterUnstagingComponent')
