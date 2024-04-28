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

import { defineComponent } from '@etherealengine/ecs'
import { Entity, EntityUUID, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { removeMaterialInstance } from '@etherealengine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { PluginObjectType, PluginType } from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { Material, Shader, WebGLRenderer } from 'three'
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

export type MaterialStatus = 'LOADED' | 'MISSING' | 'UNLOADED'

export type MaterialPrototypeConstructor = new (...args: any) => any
export type MaterialPrototypeObjectConstructor = { [key: string]: MaterialPrototypeConstructor }
export type MaterialPrototypeDefinition = {
  prototypeId: string
  prototypeConstructor: MaterialPrototypeConstructor
  arguments: PrototypeArgument
  onBeforeCompile?: (shader: Shader, renderer: WebGLRenderer) => void
}
export type MaterialComponentType = {
  prototype: string
  material: Material
  parameters: { [field: string]: any }
  plugins: string[]
  src: any
  status: MaterialStatus
  instances: Entity[]
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

export const materialSuffix = ' (Material)'

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

export enum MaterialComponents {
  MaterialInstance,
  MaterialState,
  MaterialPrototype,
  MaterialPlugin
}

export const materialByHash = {} as Record<string, EntityUUID>
export const materialByName = {} as Record<string, EntityUUID>
export const prototypeByName = {} as Record<string, Entity>

export const MaterialComponent = Array.from({ length: 4 }, (_, i) => {
  return defineComponent({
    name: `${MaterialComponents[i]}Component`,
    onInit: (entity) => {
      switch (i) {
        case MaterialComponents.MaterialInstance:
          return {
            // materialUUID points to entities with MaterialComponent holding state
            uuid: [] as EntityUUID[]
          }
        case MaterialComponents.MaterialState:
          return {
            // material & material specific data
            material: {} as Material,
            parameters: {},
            instances: [] as Entity[],
            pluginEntities: [] as Entity[],
            prototypeEntity: UndefinedEntity as Entity
          }
        case MaterialComponents.MaterialPrototype:
          return {
            // prototype state
            prototypeArguments: {} as PrototypeArgument,
            prototypeConstructor: {} as MaterialPrototypeObjectConstructor
          }
        case MaterialComponents.MaterialPlugin:
          return {
            // plugin state
            plugin: {} as PluginObjectType
          }
        default:
          return {}
      }
    },

    onSet: (entity, component, json) => {
      if (!json) return

      if (json.uuid && component.uuid.value !== undefined) component.uuid.set(json.uuid)
      if (json.material && component.material.value !== undefined) component.material.set(json.material)
      if (json.parameters && component.parameters.value !== undefined) component.parameters.set(json.parameters)
      if (json.instances && component.instances.value !== undefined) component.instances.set(json.instances)
      if (json.pluginEntities && component.pluginEntities.value !== undefined)
        component.pluginEntities.set(json.pluginEntities)
      if (json.prototypeEntity && component.prototypeEntity.value !== undefined)
        component.prototypeEntity.set(json.prototypeEntity)
      if (json.prototypeArguments && component.prototypeArguments.value !== undefined)
        component.prototypeArguments.set(json.prototypeArguments)
      if (json.prototypeConstructor && component.prototypeConstructor.value !== undefined)
        component.prototypeConstructor.set(json.prototypeConstructor)
      if (json.plugin && component.plugin.value !== undefined) component.plugin.set(json.plugin)
    },

    onRemove: (entity, component) => {
      if (component.uuid.value)
        for (let i = 0; i < component.uuid.value.length; i++) {
          removeMaterialInstance(entity, i)
        }
    }
  })
})

declare module 'three/src/materials/Material' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    needsUpdate: boolean
  }
}
