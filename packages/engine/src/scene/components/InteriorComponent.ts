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

import { Vector2 } from 'three'

import { defineComponent, getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { ComponentUpdateFunction } from '@etherealengine/spatial/src/common/constants/PrefabFunctionType'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { Interior } from '../classes/Interior'
import { addError, removeError } from '../functions/ErrorFunctions'

export type InteriorComponentType = {
  cubeMap: string
  tiling: number
  size: Vector2
  interior?: Interior
}

export const InteriorComponent = defineComponent({
  name: 'InteriorComponent',
  jsonID: 'interior',
  onInit: () => {
    return {
      cubeMap: '',
      tiling: 1,
      size: new Vector2(1, 1)
    } as InteriorComponentType
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.cubeMap === 'string') component.cubeMap.set(json.cubeMap)
    if (typeof json.tiling === 'number') component.tiling.set(json.tiling)
    if (typeof json.size === 'object') component.size.set(new Vector2(json.size.x, json.size.y))
  },
  toJSON(entity, component) {
    return {
      cubeMap: component.cubeMap.value,
      tiling: component.tiling.value,
      size: component.size.value
    }
  },
  errors: ['LOADING_ERROR']
})

export const updateInterior: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, InteriorComponent)

  if (!component.interior) {
    component.interior = new Interior(entity)
    addObjectToGroup(entity, component.interior)
  }

  const obj3d = component.interior
  if (obj3d.cubeMap !== component.cubeMap) {
    try {
      obj3d.cubeMap = component.cubeMap
      removeError(entity, InteriorComponent, 'LOADING_ERROR')
    } catch (error) {
      addError(entity, InteriorComponent, 'LOADING_ERROR', error.message)
    }
  }

  obj3d.tiling = component.tiling
  obj3d.size = component.size
}
