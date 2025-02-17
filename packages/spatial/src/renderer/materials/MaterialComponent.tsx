/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Material, Shader, WebGLRenderer } from 'three'

import {
  Component,
  UUIDComponent,
  defineComponent,
  getComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { PluginType } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { MeshComponent } from '../components/MeshComponent'
import { NoiseOffsetPluginComponent } from './constants/plugins/NoiseOffsetPlugin'
import { TransparencyDitheringPluginComponent } from './constants/plugins/TransparencyDitheringComponent'
import { setMeshMaterial } from './materialFunctions'
import MeshBasicMaterial from './prototypes/MeshBasicMaterial.mat'
import MeshLambertMaterial from './prototypes/MeshLambertMaterial.mat'
import MeshMatcapMaterial from './prototypes/MeshMatcapMaterial.mat'
import MeshPhongMaterial from './prototypes/MeshPhongMaterial.mat'
import MeshPhysicalMaterial from './prototypes/MeshPhysicalMaterial.mat'
import MeshStandardMaterial from './prototypes/MeshStandardMaterial.mat'
import MeshToonMaterial from './prototypes/MeshToonMaterial.mat'
import { ShaderMaterial } from './prototypes/ShaderMaterial.mat'
import { ShadowMaterial } from './prototypes/ShadowMaterial.mat'

export type MaterialPrototypeConstructor = new (...args: any) => any
export type MaterialPrototypeObjectConstructor = { [key: string]: MaterialPrototypeConstructor }
export type MaterialPrototypeDefinition = {
  prototypeId: string
  prototypeConstructor: MaterialPrototypeConstructor
  arguments: PrototypeArgument
  onBeforeCompile?: (shader: Shader, renderer: WebGLRenderer) => void
}

export type PrototypeArgumentValue = {
  type: string
  default: any
  min?: number
  max?: number
  options?: any[]
}

export type PrototypeArgument = {
  [_: string]: PrototypeArgumentValue
}

export const MaterialPrototypeDefinitions = defineState({
  name: 'MaterialPrototypeDefinitions',
  initial: () =>
    ({
      MeshBasicMaterial,
      MeshLambertMaterial,
      MeshMatcapMaterial,
      MeshPhongMaterial,
      MeshPhysicalMaterial,
      MeshStandardMaterial,
      MeshToonMaterial,
      ShaderMaterial,
      ShadowMaterial
    }) as Record<string, MaterialPrototypeDefinition>
})

export const MaterialPlugins = { TransparencyDitheringPluginComponent, NoiseOffsetPluginComponent } as Record<
  string,
  Component<any, any, any>
>

export const MaterialStateComponent = defineComponent({
  name: 'MaterialStateComponent',

  schema: S.Object({
    // material & material specific data
    material: S.Type<Material>({} as Material),
    parameters: S.Record(S.String(), S.Any()),
    // all entities using this material. an undefined entity at index 0 is a fake user
    instances: S.NonSerialized(S.Array(S.Entity()))
  }),

  fallbackMaterialUUID: uuidv4() as EntityUUID,
  fallbackMaterial: () => {
    const fallbackMaterialEntity = UUIDComponent.getEntityByUUID(MaterialStateComponent.fallbackMaterialUUID)
    return getComponent(fallbackMaterialEntity, MaterialStateComponent).material //.clone()
  },

  onRemove: (entity, component) => {
    if (!component.instances.value) return
    try {
      const instances = Array.isArray(component.instances.value)
        ? component.instances.value
        : [component.instances.value]
      for (const instanceEntity of instances) {
        if (!hasComponent(instanceEntity, MaterialInstanceComponent)) continue
        setMeshMaterial(instanceEntity, getComponent(instanceEntity, MaterialInstanceComponent).uuid)
      }
    } catch (e) {
      // this throws errors between tests - should be moved to a reactor
    }
  }
})

export const MaterialInstanceComponent = defineComponent({
  name: 'MaterialInstanceComponent',

  schema: S.Object({ uuid: S.Array(S.EntityUUID()) }),

  onRemove: (entity) => {
    const uuids = getOptionalComponent(entity, MaterialInstanceComponent)?.uuid
    if (!uuids) return
    for (const uuid of uuids) {
      const materialEntity = UUIDComponent.getEntityByUUID(uuid)
      if (!hasComponent(materialEntity, MaterialStateComponent)) continue
      const materialComponent = getOptionalMutableComponent(materialEntity, MaterialStateComponent)
      if (materialComponent?.instances.value)
        materialComponent.instances.set(materialComponent.instances.value.filter((instance) => instance !== entity))
    }
  },
  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = useOptionalComponent(entity, MaterialInstanceComponent)

    if (!materialComponent || materialComponent.uuid.value.length === 0) return null

    if (materialComponent.uuid.value.length > 1)
      return (
        <>
          {materialComponent.uuid.value.map((uuid, index) => (
            <MaterialInstanceSubReactor
              array={true}
              key={uuid + '-' + index}
              index={index}
              uuid={uuid}
              entity={entity}
            />
          ))}
        </>
      )

    return (
      <MaterialInstanceSubReactor
        array={false}
        key={materialComponent.uuid.value[0]}
        index={0}
        uuid={materialComponent.uuid.value[0]}
        entity={entity}
      />
    )
  }
})

const MaterialInstanceSubReactor = (props: { array: boolean; uuid: EntityUUID; entity: Entity; index: number }) => {
  const { uuid, entity, index } = props

  const materialStateEntity = UUIDComponent.useEntityByUUID(uuid)
  const materialStateComponent = useOptionalComponent(materialStateEntity, MaterialStateComponent)
  const meshComponent = useOptionalComponent(entity, MeshComponent)
  useEffect(() => {
    if (!meshComponent || !materialStateComponent) return
    const material = getComponent(materialStateEntity, MaterialStateComponent).material
    if (props.array) {
      if (!Array.isArray(meshComponent.material.value)) meshComponent.material.set([])
      meshComponent.material[index].set(material)
    } else {
      meshComponent.material.set(material)
    }

    materialStateComponent.instances.merge([entity])
  }, [materialStateComponent?.material, !!meshComponent])

  return null
}

declare module 'three/src/materials/Material.js' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    needsUpdate: boolean
  }
}

declare module 'three/src/renderers/shaders/ShaderLib.js' {
  export interface Shader {
    uuid?: EntityUUID
  }
}
