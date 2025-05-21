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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Material, Shader } from 'three'

import {
  ComponentType,
  UUIDComponent,
  defineComponent,
  getComponent,
  getOptionalComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { Entity, EntityID, EntityUUID, EntityUUIDPair } from '@ir-engine/ecs/src/Entity'
import { PluginType } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { NameComponent } from '../../common/NameComponent'
import { MeshComponent } from '../components/MeshComponent'
import MeshBasicMaterial from './prototypes/MeshBasicMaterial.mat'
import MeshLambertMaterial from './prototypes/MeshLambertMaterial.mat'
import MeshMatcapMaterial from './prototypes/MeshMatcapMaterial.mat'
import MeshPhongMaterial from './prototypes/MeshPhongMaterial.mat'
import MeshPhysicalMaterial from './prototypes/MeshPhysicalMaterial.mat'
import MeshStandardMaterial from './prototypes/MeshStandardMaterial.mat'
import MeshToonMaterial from './prototypes/MeshToonMaterial.mat'
import { ShadowMaterial } from './prototypes/ShadowMaterial.mat'

export type MaterialPrototypeConstructor = new (...args: any) => any
export type MaterialPrototypeObjectConstructor = { [key: string]: MaterialPrototypeConstructor }
export type MaterialPrototypeDefinition = {
  prototypeConstructor: MaterialPrototypeConstructor
  arguments: PrototypeArgument
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
      // ShaderMaterial, // makes no sense since we can't supply shaders
      ShadowMaterial
    }) as Record<string, MaterialPrototypeDefinition>
})

export const MaterialPluginComponents = {} as Record<string, ComponentType<any>>

/**
 * Stores the material instance and its serializable parameters for an entity
 */
export const MaterialStateComponent = defineComponent({
  name: 'MaterialStateComponent',

  jsonID: 'IR_material',

  schema: S.Object({
    material: S.Type<Material>(),
    // serialized data (textures as URLs, colors as numbers etc)
    parameters: S.Record(S.String(), S.Any())
  }),

  fallbackMaterialUUIDPair: {
    entitySourceID: 'fallback',
    entityID: 'material'
  } as EntityUUIDPair,

  fallbackMaterial: () => {
    const fallbackMaterialEntity = UUIDComponent.getEntityByUUID(
      UUIDComponent.join(MaterialStateComponent.fallbackMaterialUUIDPair)
    )
    return fallbackMaterialEntity
  },

  onSet(entity, component, json) {
    if (!json) return
    if (json.material && json.material.isMaterial) {
      component.material.set(json.material)
      Object.assign(json.material, {
        get uuid() {
          return UUIDComponent.get(entity)
        },
        set uuid(value) {
          if (value != undefined) throw new Error('Cannot set uuid of proxified object')
        },
        get name() {
          return getOptionalComponent(entity, NameComponent)
        },
        set name(value) {
          if (value != undefined) throw new Error('Cannot set name of proxified object')
        },
        get entity() {
          return entity
        }
      })
    }
    if (json.parameters) {
      component.parameters.set(json.parameters)
    }
  }
})

/**
 * Links mesh entities to their material entities, allowing materials to be shared across multiple meshes
 */
export const MaterialInstanceComponent = defineComponent({
  name: 'MaterialInstanceComponent',
  jsonID: 'IR_material_instance',

  schema: S.Object({ entities: S.Array(S.EntityID()) }),

  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = useOptionalComponent(entity, MaterialInstanceComponent)

    if (!materialComponent || materialComponent.entities.value.length === 0) return null

    if (materialComponent.entities.value.length > 1)
      return (
        <>
          {materialComponent.entities.value.map((materialEntity, index) => (
            <MaterialInstanceSubReactor
              array={true}
              key={`${materialEntity}-${index}`}
              index={index}
              materialEntityID={materialEntity}
              entity={entity}
            />
          ))}
        </>
      )

    return (
      <MaterialInstanceSubReactor
        array={false}
        key={`${materialComponent.entities.value[0]}`}
        index={0}
        materialEntityID={materialComponent.entities.value[0]}
        entity={entity}
      />
    )
  }
})

const MaterialInstanceSubReactor = (props: {
  array: boolean
  materialEntityID: EntityID
  entity: Entity
  index: number
}) => {
  const { materialEntityID, entity, index } = props

  const materialEntity = UUIDComponent.getEntityFromSameSourceByID(entity, materialEntityID)
  const materialStateComponent = useOptionalComponent(materialEntity, MaterialStateComponent)
  const meshComponent = useOptionalComponent(entity, MeshComponent)

  useEffect(() => {
    if (!meshComponent || !materialStateComponent) return
    const material = getComponent(materialEntity, MaterialStateComponent).material
    if (props.array) {
      if (!Array.isArray(meshComponent.material.value)) meshComponent.material.set([])
      meshComponent.material[index].set(material)
    } else {
      meshComponent.material.set(material)
    }
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
    shaderType: string
  }
}
