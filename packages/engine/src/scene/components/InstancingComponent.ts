import { BufferGeometry, Color, Material, MathUtils, Mesh, Texture } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { State } from '@etherealengine/hyperflux'

import { createMappedComponent, defineComponent } from '../../ecs/functions/ComponentFunctions'
import {
  GRASS_PROPERTIES_DEFAULT_VALUES,
  SCATTER_PROPERTIES_DEFAULT_VALUES
} from '../functions/loaders/InstancingFunctions'

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

export type TextureRef = {
  src: string
  texture: Texture | null
}

export type GrassProperties = {
  isGrassProperties: true
  bladeHeight: RandomizedProperty
  bladeWidth: RandomizedProperty
  joints: number
  grassTexture: TextureRef
  alphaMap: TextureRef
  ////lighting properties
  ambientStrength: number
  diffuseStrength: number
  shininess: number
  sunColor: Color
}

export type MeshProperties = {
  isMeshProperties: true
  instancedMesh: EntityUUID
}

type DensityMapped = {
  densityMap: TextureRef
  densityMapStrength: NormalizedProperty
}

type HeightMapped = {
  heightMap: TextureRef
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

export type SampleProperties = ScatterProperties & VertexProperties
export type SourceProperties = GrassProperties & MeshProperties

export type InstancingComponentType = {
  count: number
  surface: string
  sampling: SampleMode
  mode: ScatterMode
  state: ScatterState
  sampleProperties: ScatterProperties | VertexProperties
  sourceProperties: GrassProperties | MeshProperties
}

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  onInit: (entity) => {
    return {
      count: 5000,
      surface: '',
      sampling: SampleMode.SCATTER,
      mode: ScatterMode.GRASS,
      state: ScatterState.UNSTAGED,
      sampleProperties: SCATTER_PROPERTIES_DEFAULT_VALUES as ScatterProperties | VertexProperties,
      sourceProperties: GRASS_PROPERTIES_DEFAULT_VALUES as GrassProperties | MeshProperties
    }
  },
  onSet: (entity, component, json) => {
    typeof json?.count === 'number' && component.count.set(json.count)
    typeof json?.surface === 'string' && component.surface.set(json.surface)
    typeof json?.sampling === 'number' && component.sampling.set(json.sampling)
    typeof json?.mode === 'number' && component.mode.set(json.mode)
    typeof json?.state === 'number' && component.state.set(json.state)
    if ((json?.sampleProperties as ScatterProperties)?.isScatterProperties) {
      const scatterProps = json!.sampleProperties as ScatterProperties
      const scatterState = component.sampleProperties as State<ScatterProperties>
      typeof scatterProps.densityMap.src === 'string' && scatterState.densityMap.src.set(scatterProps.densityMap.src)
      typeof scatterProps.densityMapStrength === 'number' &&
        scatterState.densityMapStrength.set(scatterProps.densityMapStrength)
      typeof scatterProps.heightMap.src === 'string' && scatterState.heightMap.src.set(scatterProps.heightMap.src)
      typeof scatterProps.heightMapStrength === 'number' &&
        scatterState.heightMapStrength.set(scatterProps.heightMapStrength)
    }
    if ((json?.sampleProperties as VertexProperties)?.isVertexProperties) {
      const vertexProps = json!.sampleProperties as VertexProperties
      const vertexState = component.sampleProperties as State<VertexProperties>
      typeof vertexProps.densityMap.src === 'string' && vertexState.densityMap.src.set(vertexProps.densityMap.src)
      typeof vertexProps.densityMapStrength === 'number' &&
        vertexState.densityMapStrength.set(vertexProps.densityMapStrength)
      typeof vertexProps.heightMap.src === 'string' && vertexState.heightMap.src.set(vertexProps.heightMap.src)
      typeof vertexProps.heightMapStrength === 'number' &&
        vertexState.heightMapStrength.set(vertexProps.heightMapStrength)
      typeof vertexProps.vertexColors === 'boolean' && vertexState.vertexColors.set(vertexProps.vertexColors)
    }
  },
  toJSON: (entity, component) => {
    const comp = component.value

    const sampleJson = {
      densityMap: {
        src: comp.sampleProperties.densityMap.src,
        texture: null
      },
      densityMapStrength: comp.sampleProperties.densityMapStrength,
      heightMap: {
        src: comp.sampleProperties.heightMap.src,
        texture: null
      },
      heightMapStrength: comp.sampleProperties.heightMapStrength,
      ...((comp.sampleProperties as VertexProperties).isVertexProperties
        ? { vertexColors: (comp.sampleProperties as VertexProperties).vertexColors }
        : {})
    } as ScatterProperties | VertexProperties

    const sourceJson = {} as GrassProperties | MeshProperties
    if ((comp.sourceProperties as GrassProperties).isGrassProperties) {
      const grassProps = comp.sourceProperties as GrassProperties
      const grassJson = sourceJson as GrassProperties
      grassJson.bladeHeight = grassProps.bladeHeight
      grassJson.bladeWidth = grassProps.bladeWidth
      grassJson.joints = grassProps.joints
      grassJson.grassTexture = {
        src: grassProps.grassTexture.src,
        texture: null
      }
      grassJson.alphaMap = {
        src: grassProps.alphaMap.src,
        texture: null
      }
      grassJson.ambientStrength = grassProps.ambientStrength
      grassJson.diffuseStrength = grassProps.diffuseStrength
      grassJson.shininess = grassProps.shininess
      grassJson.sunColor = grassProps.sunColor
    }

    if ((comp.sourceProperties as MeshProperties).isMeshProperties) {
      const meshProps = comp.sourceProperties as MeshProperties
      const meshJson = sourceJson as MeshProperties
      meshJson.instancedMesh = meshProps.instancedMesh
    }
    return {
      count: comp.count,
      surface: comp.surface,
      sampling: comp.sampling,
      mode: comp.mode,
      state: comp.state,
      sampleProperties: sampleJson,
      sourceProperties: sourceJson
    }
  }
})

export const InstancingStagingComponent = createMappedComponent('InstancingStagingComponent')

export const InstancingUnstagingComponent = createMappedComponent('InstancingUnstagingComponent')
