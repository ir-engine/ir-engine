/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Color, Material, Mesh, Texture } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { getMutableState, State, useHookstate } from '@etherealengine/hyperflux'

import { cleanupAllMeshData } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineComponent, getComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import {
  GRASS_PROPERTIES_DEFAULT_VALUES,
  SCATTER_PROPERTIES_DEFAULT_VALUES,
  stageInstancing,
  unstageInstancing
} from '../functions/loaders/InstancingFunctions'
import { GroupComponent } from './GroupComponent'
import { UUIDComponent } from './UUIDComponent'

export enum SampleMode {
  SCATTER,
  VERTICES,
  NODES
}

export enum ScatterMode {
  GRASS,
  MESH
}

export const ScatterState = {
  UNSTAGED: 'unstaged' as const,
  UNSTAGING: 'unstaging' as const,
  STAGING: 'staging' as const,
  STAGED: 'staged' as const,
  SCATTERING: 'scattering' as const,
  SCATTERED: 'scattered' as const
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
  state: (typeof ScatterState)[keyof typeof ScatterState]
  sampleProperties: ScatterProperties | VertexProperties
  sourceProperties: GrassProperties | MeshProperties
}

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'instancing',

  onInit: (entity) => {
    return {
      count: 5000,
      surface: '' as EntityUUID,
      sampling: SampleMode.SCATTER,
      mode: ScatterMode.GRASS,
      sampleProperties: SCATTER_PROPERTIES_DEFAULT_VALUES as ScatterProperties | VertexProperties,
      sourceProperties: GRASS_PROPERTIES_DEFAULT_VALUES as GrassProperties | MeshProperties,
      // internal
      state: ScatterState.UNSTAGED as (typeof ScatterState)[keyof typeof ScatterState],
      mesh: null as Mesh | null
    }
  },

  onSet: (entity, component, json) => {
    typeof json?.count === 'number' && component.count.set(json.count)
    typeof json?.surface === 'string' && component.surface.set(json.surface)
    typeof json?.sampling === 'number' && component.sampling.set(json.sampling)
    typeof json?.mode === 'number' && component.mode.set(json.mode)
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
      sampleProperties: sampleJson,
      sourceProperties: sourceJson
    }
  },

  reactor: function () {
    if (!isClient) return null

    const entity = useEntityContext()

    const instancingComponent = useComponent(entity, InstancingComponent)
    const sceneLoaded = useHookstate(getMutableState(EngineState).sceneLoaded)

    useEffect(() => {
      if (!sceneLoaded.value || instancingComponent.state.value !== ScatterState.UNSTAGED) return

      stageInstancing(entity)
    }, [sceneLoaded, instancingComponent.state])

    useEffect(() => {
      if (!sceneLoaded.value || instancingComponent.state.value !== ScatterState.STAGED) return

      const refEntity = UUIDComponent.entitiesByUUIDState.value[instancingComponent.surface.value]
      const groupComponent = getComponent(refEntity, GroupComponent)

      for (const obj of groupComponent) {
        obj.traverse((child: Mesh<any, Material>) => {
          cleanupAllMeshData(child, {})
        })
      }
    }, [instancingComponent.state, sceneLoaded])

    useEffect(() => {
      if (instancingComponent.state.value !== ScatterState.UNSTAGING) return

      unstageInstancing(entity)
    }, [instancingComponent.state])

    return null
  }
})
