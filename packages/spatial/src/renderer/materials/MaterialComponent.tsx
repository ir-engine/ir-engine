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

import { Material, Mesh, Shader, WebGLRenderer } from 'three'

import {
  Component,
  UUIDComponent,
  defineComponent,
  defineQuery,
  getComponent,
  getMutableComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { Entity, EntityUUID, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { PluginType } from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'

import React, { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { MeshComponent } from '../components/MeshComponent'
import { NoiseOffsetPlugin } from './constants/plugins/NoiseOffsetPlugin'
import { TransparencyDitheringPlugin } from './constants/plugins/TransparencyDitheringComponent'
import { materialPrototypeMatches, setMeshMaterial, updateMaterialPrototype } from './materialFunctions'
import MeshBasicMaterial from './prototypes/MeshBasicMaterial.mat'
import MeshLambertMaterial from './prototypes/MeshLambertMaterial.mat'
import MeshMatcapMaterial from './prototypes/MeshMatcapMaterial.mat'
import MeshPhongMaterial from './prototypes/MeshPhongMaterial.mat'
import MeshPhysicalMaterial from './prototypes/MeshPhysicalMaterial.mat'
import MeshStandardMaterial from './prototypes/MeshStandardMaterial.mat'
import MeshToonMaterial from './prototypes/MeshToonMaterial.mat'
import { ShaderMaterial } from './prototypes/ShaderMaterial.mat'
import { ShadowMaterial } from './prototypes/ShadowMaterial.mat'
export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialPrototypeConstructor = new (...args: any) => any
export type MaterialPrototypeObjectConstructor = { [key: string]: MaterialPrototypeConstructor }
export type MaterialPrototypeDefinition = {
  prototypeId: string
  prototypeConstructor: MaterialPrototypeConstructor
  arguments: PrototypeArgument
  onBeforeCompile?: (shader: Shader, renderer: WebGLRenderer) => void
}

export type PrototypeArgument = {
  [_: string]: {
    type: string
    default: any
    min?: number
    max?: number
    options?: any[]
  }
}

export const MaterialPrototypeDefinitions = [
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshToonMaterial,
  ShaderMaterial,
  ShadowMaterial
] as MaterialPrototypeDefinition[]

export const MaterialPlugins = { TransparencyDitheringPlugin, NoiseOffsetPlugin } as Record<
  string,
  Component<any, any, any>
>

export const MaterialStateComponent = defineComponent({
  name: 'MaterialStateComponent',
  onInit: (entity) => {
    return {
      // material & material specific data
      material: {} as Material,
      parameters: {} as { [key: string]: any },
      // all entities using this material. an undefined entity at index 0 is a fake user
      instances: [] as Entity[],
      prototypeEntity: UndefinedEntity as Entity
    }
  },

  onSet: (entity, component, json) => {
    if (json?.material && component.material.value !== undefined) component.material.set(json.material)
    if (json?.parameters && component.parameters.value !== undefined) component.parameters.set(json.parameters)
    if (json?.instances && component.instances.value !== undefined) component.instances.set(json.instances)
    if (json?.prototypeEntity && component.prototypeEntity.value !== undefined)
      component.prototypeEntity.set(json.prototypeEntity)
  },

  fallbackMaterial: uuidv4() as EntityUUID,

  onRemove: (entity) => {
    const materialComponent = getComponent(entity, MaterialStateComponent)
    for (const instanceEntity of materialComponent.instances) {
      setMeshMaterial(instanceEntity, getComponent(instanceEntity, MaterialInstanceComponent).uuid)
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      if (materialComponent.prototypeEntity.value && !materialPrototypeMatches(entity)) updateMaterialPrototype(entity)
    }, [materialComponent.prototypeEntity])

    return null
  }
})

export const MaterialInstanceComponent = defineComponent({
  name: 'MaterialInstanceComponent',
  onInit: (entity) => {
    return {
      uuid: [] as EntityUUID[]
    }
  },
  onSet: (entity, component, json) => {
    if (json?.uuid && component.uuid.value !== undefined) component.uuid.set(json.uuid)
  },
  onRemove: (entity) => {
    const uuids = getComponent(entity, MaterialInstanceComponent).uuid
    for (const uuid of uuids) {
      const materialEntity = UUIDComponent.getEntityByUUID(uuid)
      const materialComponent = getMutableComponent(materialEntity, MaterialStateComponent)
      if (materialComponent.instances.value)
        materialComponent.instances.set(materialComponent.instances.value.filter((instance) => instance !== entity))
    }
  },
  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = useComponent(entity, MaterialInstanceComponent)
    const meshComponent = useComponent(entity, MeshComponent)

    if (Array.isArray(meshComponent.material.value))
      return (
        <>
          {materialComponent.uuid.value.map((uuid, index) => (
            <MaterialInstanceSubReactor key={uuid} index={index} uuid={uuid} entity={entity} />
          ))}
        </>
      )

    return (
      <MaterialInstanceSubReactor
        key={materialComponent.uuid.value[0]}
        index={0}
        uuid={materialComponent.uuid.value[0]}
        entity={entity}
      />
    )
  }
})

const MaterialInstanceSubReactor = (props: { uuid: EntityUUID; entity: Entity; index: number }) => {
  const { uuid, entity, index } = props
  const materialStateEntity = UUIDComponent.useEntityByUUID(uuid)
  const materialStateComponent = useComponent(materialStateEntity, MaterialStateComponent)
  const meshComponent = useComponent(entity, MeshComponent)

  useEffect(() => {
    const mesh = meshComponent.value as Mesh
    const material = materialStateComponent.material.value as Material
    if (Array.isArray(mesh.material)) mesh.material[index] = material
    mesh.material = material
  }, [materialStateComponent.material])

  return null
}

export const MaterialPrototypeComponent = defineComponent({
  name: 'MaterialPrototypeComponent',
  onInit: (entity) => {
    return {
      prototypeArguments: {} as PrototypeArgument,
      prototypeConstructor: {} as MaterialPrototypeObjectConstructor
    }
  },
  onSet: (entity, component, json) => {
    if (json?.prototypeArguments && component.prototypeArguments.value !== undefined)
      component.prototypeArguments.set(json.prototypeArguments)
    if (json?.prototypeConstructor && component.prototypeConstructor.value !== undefined)
      component.prototypeConstructor.set(json.prototypeConstructor)
  }
})

export const prototypeQuery = defineQuery([MaterialPrototypeComponent])

declare module 'three/src/materials/Material' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    needsUpdate: boolean
  }
}

declare module 'three/src/renderers/shaders/ShaderLib' {
  export interface Shader {
    uuid?: EntityUUID
  }
}
