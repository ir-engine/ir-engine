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

import { Types } from 'bitecs'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'
import { getMutableState } from '@etherealengine/hyperflux'

import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
  matrix: Matrix4
}

const { f64 } = Types
export const Vector3Schema = { x: f64, y: f64, z: f64 }
export const QuaternionSchema = { x: f64, y: f64, z: f64, w: f64 }
export const PoseSchema = {
  position: Vector3Schema,
  rotation: QuaternionSchema
}
export const TransformSchema = {
  position: Vector3Schema,
  rotation: QuaternionSchema,
  scale: Vector3Schema
}

export const TransformComponent = defineComponent({
  name: 'TransformComponent',
  jsonID: 'transform',
  schema: TransformSchema,

  onInit: (entity) => {
    return {
      position: null! as Vector3,
      rotation: null! as Quaternion,
      scale: null! as Vector3,
      matrix: new Matrix4(),
      matrixInverse: new Matrix4()
    }
  },

  onSet: (entity, component, json) => {
    const dirtyTransforms = TransformComponent.dirtyTransforms

    if (!component.position.value)
      component.position.set(
        proxifyVector3WithDirty(TransformComponent.position, entity, dirtyTransforms, new Vector3())
      )
    if (!component.rotation.value)
      component.rotation.set(
        proxifyQuaternionWithDirty(TransformComponent.rotation, entity, dirtyTransforms, new Quaternion())
      )
    if (!component.scale.value)
      component.scale.set(
        proxifyVector3WithDirty(TransformComponent.scale, entity, dirtyTransforms, new Vector3(1, 1, 1))
      )

    if (!json) return

    const rotation = json.rotation
      ? typeof json.rotation.w === 'number'
        ? json.rotation
        : new Quaternion().setFromEuler(new Euler().setFromVector3(json.rotation as any as Vector3))
      : undefined

    if (json.position) component.position.value.copy(json.position)
    if (rotation) component.rotation.value.copy(rotation)
    if (json.scale) component.scale.value.copy(json.scale)

    const localTransform = getOptionalComponent(entity, LocalTransformComponent)
    if (localTransform) {
      localTransform.position.copy(component.position.value)
      localTransform.rotation.copy(component.rotation.value)
      localTransform.scale.copy(component.scale.value)
    }
  },

  toJSON(entity, comp) {
    const component = hasComponent(entity, LocalTransformComponent)
      ? getComponent(entity, LocalTransformComponent)
      : comp.value
    return {
      position: new Vector3().copy(component.position),
      rotation: new Quaternion().copy(component.rotation),
      scale: new Vector3().copy(component.scale)
    }
  },

  onRemove: (entity) => {
    delete TransformComponent.dirtyTransforms[entity]
  },

  dirtyTransforms: {} as Record<Entity, boolean>
})

export const LocalTransformComponent = defineComponent({
  name: 'LocalTransformComponent',
  schema: TransformSchema,

  onInit: (entity) => {
    return {
      parentEntity: UndefinedEntity as Entity,
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1),
      matrix: new Matrix4()
    }
  },

  onSet: (entity, component, json: Partial<DeepReadonly<TransformComponentType>> & { parentEntity: Entity }) => {
    if (!json) return

    const position = json.position ?? new Vector3()
    const rotation = json.rotation ?? new Quaternion()
    const scale = json.scale ?? new Vector3(1, 1, 1)
    const parentEntity = json.parentEntity

    const dirtyTransforms = TransformComponent.dirtyTransforms

    if (entity === parentEntity!) throw new Error('Tried to parent entity to self - this is not allowed')
    if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)

    getMutableState(EngineState).transformsNeedSorting.set(true)

    component.parentEntity.set(parentEntity)

    // clone incoming transform properties, because we don't want to accidentally bind obj properties to local transform
    component.position.set(
      proxifyVector3WithDirty(LocalTransformComponent.position, entity, dirtyTransforms, position.clone())
    )
    component.rotation.set(
      proxifyQuaternionWithDirty(LocalTransformComponent.rotation, entity, dirtyTransforms, rotation.clone())
    )
    component.scale.set(proxifyVector3WithDirty(LocalTransformComponent.scale, entity, dirtyTransforms, scale.clone()))

    component.matrix.value.identity()
  }
})

globalThis.TransformComponent = TransformComponent

/**
 * @deprecated - now included in TransfromComponent.onSet
 * Sets the transform component.
 * Used for objects that exist as part of the world - such as avatars and scene objects
 * @param entity
 * @param parentEntity
 * @param position
 * @param rotation
 * @param scale
 * @returns
 */
export function setTransformComponent(entity: Entity, position?: Vector3, rotation?: Quaternion, scale?: Vector3) {
  setComponent(entity, TransformComponent, { position, rotation, scale })
}

/**
 * @deprecated - now included in LocalTransfromComponent.onSet
 * Sets the local transform component. This is used to calculate relative transforms.
 * Used for objects that exist as part of a specific coordinate system - such as avatars and scene objects
 * @param entity
 * @param parentEntity
 * @param position
 * @param rotation
 * @param scale
 * @returns
 */
export function setLocalTransformComponent(
  entity: Entity,
  parentEntity: Entity,
  position = new Vector3(),
  rotation = new Quaternion(),
  scale = new Vector3(1, 1, 1)
) {
  setComponent(entity, LocalTransformComponent, { parentEntity, position, rotation, scale })
}
