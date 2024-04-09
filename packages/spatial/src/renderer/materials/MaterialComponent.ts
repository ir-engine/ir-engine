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

import { UUIDComponent, defineComponent, getComponent, getMutableComponent, setComponent } from '@etherealengine/ecs'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { PluginType } from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { NameComponent } from '../../common/NameComponent'
import { hashMaterial } from './materialFunctions'

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

export type MaterialPrototype<T extends Material = Material> = {
  prototypeId: string
  baseMaterial: { new (params): T }
  arguments: {
    [_: string]: {
      type: string
      default: any
      min?: number
      max?: number
      options?: any[]
    }
  }
}

export const MaterialComponent = defineComponent({
  name: 'MaterialComponent',
  onInit: (entity) => {
    return {
      // materialUUID points to entities with MaterialComponent holding state
      uuid: [] as string[],
      // material & material specific data
      material: null as null | Material,
      instances: [] as Entity[],
      hash: '',
      source: '',
      plugins: [] as string[],
      prototypeUuid: '',
      // shared material state
      prototype: {} as MaterialPrototype
    }
  },

  materialByHash: {} as Record<string, string>,

  setMaterialName: (entity: Entity, name: string) => {
    const materialComponent = getMutableComponent(entity, MaterialComponent)
    if (!materialComponent.material.value) return
    setComponent(entity, NameComponent, name)
    materialComponent.hash.set(hashMaterial(getComponent(entity, MaterialComponent).source, name))
    materialComponent.material.value.name = name
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.uuid) component.uuid.set(json.uuid)
    if (json.material) component.material.set(json.material)
    if (json.instances) component.instances.set(json.instances)
    if (json.hash) {
      component.hash.set(json.hash)
      if (json.hash != '') MaterialComponent.materialByHash[json.hash] = getComponent(entity, UUIDComponent)
    }
    if (json.plugins) component.plugins.set(json.plugins)
    if (json.source) component.source.set(json.source)
    if (json.prototypeUuid) component.prototypeUuid.set(json.prototypeUuid)
    if (json.prototype) component.prototype.set(json.prototype)
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
