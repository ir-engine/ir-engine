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

import { UUIDComponent, defineComponent, getComponent } from '@etherealengine/ecs'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { PluginType } from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { MaterialSource } from './MaterialSource'

export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialStatus = 'LOADED' | 'MISSING' | 'UNLOADED'

export type MaterialComponentType = {
  prototype: string
  material: Material
  parameters: { [field: string]: any }
  plugins: string[]
  src: MaterialSource
  status: MaterialStatus
  instances: Entity[]
}

export const MaterialComponent = defineComponent({
  name: 'MaterialComponent',
  onInit: (entity) => {
    return {
      uuid: [] as string[],
      material: null as null | Material,
      instances: [] as Entity[],
      hash: ''
    }
  },

  materialByHash: {} as Record<string, string>,

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.uuid) component.uuid.set(json.uuid)
    if (json.material) component.material.set(json.material)
    if (json.instances) component.instances.set(json.instances)
    if (json.hash) {
      component.hash.set(json.hash)
      if (json.hash != '') MaterialComponent.materialByHash[json.hash] = getComponent(entity, UUIDComponent)
    }
  }
})

declare module 'three/src/materials/Material' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    entity: Entity
    needsUpdate: boolean
  }
}
