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

import { Vector2 } from 'three'

import { defineComponent, defineQuery, Entity, getComponent, UndefinedEntity, useQuery } from '@ir-engine/ecs'
import { defineState, getState } from '@ir-engine/hyperflux'

export const InputPointerState = defineState({
  name: 'InputPointerState',
  initial() {
    return {
      pointers: new Map<string, Entity>()
    }
  }
})

export const InputPointerComponent = defineComponent({
  name: 'InputPointerComponent',

  onInit: () => {
    return {
      pointerId: -1 as number,
      position: new Vector2(),
      lastPosition: new Vector2(),
      movement: new Vector2(),
      cameraEntity: UndefinedEntity
    }
  },

  onSet(entity, component, args: { pointerId: number; cameraEntity: Entity }) {
    component.pointerId.set(args.pointerId)
    component.cameraEntity.set(args.cameraEntity)
    const pointerHash = `canvas-${args.cameraEntity}.pointer-${args.pointerId}`
    getState(InputPointerState).pointers.set(pointerHash, entity)
  },

  onRemove(entity, component) {
    const pointerHash = `canvas-${component.cameraEntity}.pointer-${component.pointerId}`
    getState(InputPointerState).pointers.delete(pointerHash)
  },

  getPointersForCamera(cameraEntity: Entity) {
    return pointerQuery().filter((entity) => getComponent(entity, InputPointerComponent).cameraEntity === cameraEntity)
  },

  usePointersForCamera(cameraEntity: Entity) {
    const pointers = useQuery([InputPointerComponent])
    return pointers.filter((entity) => getComponent(entity, InputPointerComponent).cameraEntity === cameraEntity)
  },

  getPointerByID(cameraEntity: Entity, pointerId: number) {
    const pointerHash = `canvas-${cameraEntity}.pointer-${pointerId}`
    return getState(InputPointerState).pointers.get(pointerHash) ?? UndefinedEntity
  }
})

const pointerQuery = defineQuery([InputPointerComponent])
