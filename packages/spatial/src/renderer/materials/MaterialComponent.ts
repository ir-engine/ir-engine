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

import { Material, Shader } from 'three'

import { defineComponent } from '@etherealengine/ecs'
import { Entity, EntityUUID } from '@etherealengine/ecs/src/Entity'
import { removeMaterialInstance } from '@etherealengine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { PluginType } from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'

export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialStatus = 'LOADED' | 'MISSING' | 'UNLOADED'

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

export const MaterialComponent = defineComponent({
  name: 'MaterialComponent',
  onInit: (entity) => {
    return {
      // materialUUID points to entities with MaterialComponent holding state
      uuid: [] as EntityUUID[],
      // material & material specific data
      material: null as null | Material,
      parameters: {},
      instances: [] as Entity[],
      plugins: [] as string[],
      prototypeUuid: '' as EntityUUID,
      // shared prototype state
      prototypeName: '',
      prototypeArguments: {} as PrototypeArgument
    }
  },

  materialByHash: {} as Record<string, EntityUUID>,
  materialByName: {} as Record<string, EntityUUID>,
  prototypeByName: {} as Record<string, EntityUUID>,

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.uuid) component.uuid.set(json.uuid)
    if (json.material) component.material.set(json.material)
    if (json.parameters) component.parameters.set(json.parameters)
    if (json.instances) component.instances.set(json.instances)
    if (json.plugins) component.plugins.set(json.plugins)
    if (json.prototypeUuid) component.prototypeUuid.set(json.prototypeUuid)
    if (json.prototypeName) component.prototypeName.set(json.prototypeName)
    if (json.prototypeArguments) component.prototypeArguments.set(json.prototypeArguments)
  },

  onRemove: (entity, component) => {
    for (let i = 0; i < component.uuid.value.length; i++) {
      removeMaterialInstance(entity, i)
    }
  }
})

declare module 'three/src/materials/Material' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    needsUpdate: boolean
  }
}
