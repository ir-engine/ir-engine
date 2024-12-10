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

import {
  defineComponent,
  defineQuery,
  Entity,
  getComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  useQuery
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState, getState, OpaqueType, useImmediateEffect } from '@ir-engine/hyperflux'
import { T } from '../../schema/schemaFunctions'

/**
 * @description
 * Type alias for CameraPointer hashes.
 * Strings of this type Hash should be created with `InputPointerState.createCameraPointerHash(entity, pointerID)` */
export type CameraPointerHash = OpaqueType<'CameraPointerHash'> & string

export const InputPointerState = defineState({
  name: 'InputPointerState',
  initial() {
    return {
      pointers: new Map<CameraPointerHash, Entity>()
    }
  },

  /**
   * @description
   *  Creates a string ID (aka hash) for the given `@param camera` and `@param pointer`,
   *  with the format expected by the Keys of  `InputPointerState.pointers` Map.
   * @warning Remember to call `.value` before sending the data into this function if you are getting them from a Component. */
  createCameraPointerHash(camera: Entity, pointer: number): CameraPointerHash {
    return `canvas-${camera}.pointer-${pointer}` as CameraPointerHash
  }
})

export const InputPointerComponent = defineComponent({
  name: 'InputPointerComponent',

  schema: S.Object({
    pointerId: S.Number(-1),
    position: T.Vec2(),
    lastPosition: T.Vec2(),
    movement: T.Vec2(),
    cameraEntity: S.Entity()
  }),

  onSet(entity, component, json: { pointerId: number; cameraEntity: Entity }) {
    if (typeof json.pointerId === 'number') component.pointerId.set(json.pointerId)
    if (typeof json.cameraEntity === 'number') component.cameraEntity.set(json.cameraEntity)
  },

  reactor: () => {
    const entity = useEntityContext()
    const inputPointerComponent = useComponent(entity, InputPointerComponent)

    useImmediateEffect(() => {
      const pointerId = inputPointerComponent.pointerId.value
      const cameraEntity = inputPointerComponent.cameraEntity.value
      const pointerHash = InputPointerState.createCameraPointerHash(cameraEntity, pointerId)

      getState(InputPointerState).pointers.set(pointerHash, entity)
      return () => {
        getState(InputPointerState).pointers.delete(pointerHash)
      }
    }, [inputPointerComponent.pointerId, inputPointerComponent.cameraEntity])

    return null
  },

  getPointersForCamera(cameraEntity: Entity) {
    return pointerQuery().filter((entity) => getComponent(entity, InputPointerComponent).cameraEntity === cameraEntity)
  },

  usePointersForCamera(cameraEntity: Entity) {
    const pointers = useQuery([InputPointerComponent])
    return pointers.filter((entity) => getComponent(entity, InputPointerComponent).cameraEntity === cameraEntity)
  },

  getPointerByID(cameraEntity: Entity, pointerId: number) {
    const pointerHash = InputPointerState.createCameraPointerHash(cameraEntity, pointerId)
    return getState(InputPointerState).pointers.get(pointerHash) ?? UndefinedEntity
  }
})

const pointerQuery = defineQuery([InputPointerComponent])
