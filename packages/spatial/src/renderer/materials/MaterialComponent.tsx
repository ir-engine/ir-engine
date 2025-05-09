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

import { Material, Shader } from 'three'

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
import { Entity, EntityUUID, EntityUUIDPair } from '@ir-engine/ecs/src/Entity'
import { PluginType } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
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

  jsonID: 'IR_material_component',

  schema: S.Object({
    // material & material specific data
    material: S.Type<Material>({ default: {} as Material }),
    parameters: S.Record(S.String(), S.Any()),
    // all entities using this material. an undefined entity at index 0 is a fake user
    /**@todo move to state */
    instances: S.Array(S.Entity(), { serialized: false }),
    // this has to exist so scene deltas can keep track of material prototype changes
    prototype: S.String()
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

  onRemove: (_, component) => {
    if (!component.instances.value) return
    try {
      const instances = Array.isArray(component.instances.value)
        ? component.instances.value
        : [component.instances.value]
      for (const instanceEntity of instances) {
        if (!hasComponent(instanceEntity, MaterialInstanceComponent)) continue
        setMeshMaterial(instanceEntity, getComponent(instanceEntity, MaterialInstanceComponent).entities)
      }
    } catch (e) {
      // this throws errors between tests - should be moved to a reactor
    }
  }
})

export const MaterialInstanceComponent = defineComponent({
  name: 'MaterialInstanceComponent',

  schema: S.Object({ entities: S.Array(S.Entity()) }),

  onRemove: (entity) => {
    const materialEntities = getOptionalComponent(entity, MaterialInstanceComponent)?.entities
    if (!materialEntities) return
    for (const materialEntity of materialEntities) {
      if (!hasComponent(materialEntity, MaterialStateComponent)) continue
      const materialComponent = getOptionalMutableComponent(materialEntity, MaterialStateComponent)
      if (materialComponent?.instances.value)
        materialComponent.instances.set(materialComponent.instances.value.filter((instance) => instance !== entity))
    }
  },
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
              materialEntity={materialEntity}
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
        materialEntity={materialComponent.entities.value[0]}
        entity={entity}
      />
    )
  }
})

const MaterialInstanceSubReactor = (props: {
  array: boolean
  materialEntity: Entity
  entity: Entity
  index: number
}) => {
  const { materialEntity, entity, index } = props

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
