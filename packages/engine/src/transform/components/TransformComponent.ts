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

import { isZero } from '../../common/functions/MathFunctions'
import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'

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

const matrix = new Matrix4()

export const TransformComponent = defineComponent({
  name: 'TransformComponent',
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
    if (json.scale && !isZero(json.scale)) component.scale.value.copy(json.scale)

    component.matrix.value.compose(component.position.value, component.rotation.value, component.scale.value)
    component.matrixInverse.value.copy(component.matrix.value).invert()

    const localTransform = getOptionalComponent(entity, LocalTransformComponent)
    const entityTree = getOptionalComponent(entity, EntityTreeComponent)
    if (localTransform && entityTree?.parentEntity) {
      const parentEntity = entityTree.parentEntity
      const parentTransform = getOptionalComponent(parentEntity, TransformComponent)
      if (parentTransform) {
        const localMatrix = matrix.copy(component.matrix.value).premultiply(parentTransform.matrixInverse)
        localMatrix.decompose(localTransform.position, localTransform.rotation, localTransform.scale)
      }
    }
  },

  onRemove: (entity) => {
    delete TransformComponent.dirtyTransforms[entity]
  },

  dirtyTransforms: {} as Record<Entity, boolean>
})

export const LocalTransformComponent = defineComponent({
  name: 'LocalTransformComponent',
  jsonID: 'transform',
  schema: TransformSchema,

  onInit: (entity) => {
    return {
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1),
      matrix: new Matrix4()
    }
  },

  toJSON: (entity, component) => {
    return {
      position: component.position.value,
      rotation: component.rotation.value,
      scale: component.scale.value
    }
  },

  onSet: (entity, component, json: Partial<DeepReadonly<TransformComponentType>>) => {
    if (!json) return

    const position = json.position?.isVector3
      ? json.position
      : json.position
      ? new Vector3(json.position.x, json.position.y, json.position.z)
      : new Vector3()
    const rotation = json.rotation?.isQuaternion
      ? json.rotation
      : json.rotation
      ? new Quaternion(json.rotation.x, json.rotation.y, json.rotation.z, json.rotation.w)
      : new Quaternion()
    const scale = json.scale?.isVector3
      ? json.scale
      : json.scale
      ? new Vector3(json.scale.x, json.scale.y, json.scale.z)
      : new Vector3(1, 1, 1)
    const dirtyTransforms = TransformComponent.dirtyTransforms

    if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)

    getMutableState(EngineState).transformsNeedSorting.set(true)

    // clone incoming transform properties, because we don't want to accidentally bind obj properties to local transform
    component.position.set(
      proxifyVector3WithDirty(LocalTransformComponent.position, entity, dirtyTransforms, position.clone())
    )
    component.rotation.set(
      proxifyQuaternionWithDirty(LocalTransformComponent.rotation, entity, dirtyTransforms, rotation.clone())
    )
    component.scale.set(proxifyVector3WithDirty(LocalTransformComponent.scale, entity, dirtyTransforms, scale.clone()))

    component.matrix.value.compose(component.position.value, component.rotation.value, component.scale.value)
  }
})

globalThis.TransformComponent = TransformComponent
