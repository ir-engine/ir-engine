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
  getComponent,
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
  matrixInverse: Matrix4
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
    const dirtyTransforms = TransformComponent.dirtyTransforms
    const component = {
      position: proxifyVector3WithDirty(TransformComponent.position, entity, dirtyTransforms) as Vector3,
      rotation: proxifyQuaternionWithDirty(TransformComponent.rotation, entity, dirtyTransforms) as Quaternion,
      scale: proxifyVector3WithDirty(
        TransformComponent.scale,
        entity,
        dirtyTransforms,
        new Vector3(1, 1, 1)
      ) as Vector3,
      matrix: new Matrix4(),
      matrixInverse: new Matrix4()
    } as TransformComponentType
    return component
  },

  onSet: (entity, component, json) => {
    const rotation = json?.rotation
      ? typeof json.rotation.w === 'number'
        ? json.rotation
        : new Quaternion().setFromEuler(new Euler().setFromVector3(json.rotation as any as Vector3))
      : undefined

    if (json?.position) component.position.value.copy(json.position)
    if (rotation) component.rotation.value.copy(rotation)
    if (json?.scale && !isZero(json.scale)) component.scale.value.copy(json.scale)

    component.matrix.value.compose(component.position.value, component.rotation.value, component.scale.value)
    component.matrixInverse.value.copy(component.matrix.value).invert()

    /** Update local transform */
    const localTransform = getOptionalComponent(entity, LocalTransformComponent)
    const entityTree = getOptionalComponent(entity, EntityTreeComponent)
    if (localTransform && entityTree?.parentEntity) {
      const parentEntity = entityTree.parentEntity
      const parentTransform = getOptionalComponent(parentEntity, TransformComponent)
      if (parentTransform) {
        localTransform.matrix.copy(component.matrix.value).premultiply(parentTransform.matrixInverse)
        localTransform.matrix.decompose(localTransform.position, localTransform.rotation, localTransform.scale)
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
    const dirtyTransforms = TransformComponent.dirtyTransforms

    const component = {
      position: proxifyVector3WithDirty(LocalTransformComponent.position, entity, dirtyTransforms) as Vector3,
      rotation: proxifyQuaternionWithDirty(LocalTransformComponent.rotation, entity, dirtyTransforms) as Quaternion,
      scale: proxifyVector3WithDirty(
        LocalTransformComponent.scale,
        entity,
        dirtyTransforms,
        new Vector3(1, 1, 1)
      ) as Vector3,
      matrix: new Matrix4()
    } as TransformComponentType

    return component
  },

  toJSON: (entity, component) => {
    return {
      position: {
        x: component.position.value.x,
        y: component.position.value.y,
        z: component.position.value.z
      } as Vector3,
      rotation: {
        x: component.rotation.value.x,
        y: component.rotation.value.y,
        z: component.rotation.value.z,
        w: component.rotation.value.w
      } as Quaternion,
      scale: {
        x: component.scale.value.x,
        y: component.scale.value.y,
        z: component.scale.value.z
      } as Vector3
    }
  },

  onSet: (entity, component, json: Partial<DeepReadonly<TransformComponentType>> = {}) => {
    if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)
    getMutableState(EngineState).transformsNeedSorting.set(true)

    const position = json.position?.isVector3
      ? json.position
      : json.position
      ? new Vector3(json.position.x, json.position.y, json.position.z)
      : null

    if (position) component.position.value.copy(position)

    const rotation = json.rotation?.isQuaternion
      ? json.rotation
      : json.rotation
      ? new Quaternion(json.rotation.x, json.rotation.y, json.rotation.z, json.rotation.w)
      : null

    if (rotation) component.rotation.value.copy(rotation)

    const scale = json.scale?.isVector3
      ? json.scale
      : json.scale
      ? new Vector3(json.scale.x, json.scale.y, json.scale.z)
      : null

    if (scale) component.scale.value.copy(scale)

    component.matrix.value.compose(component.position.value, component.rotation.value, component.scale.value)

    // ensure TransformComponent is updated immediately, raising warnings if it does not have a parent
    const entityTree = getOptionalComponent(entity, EntityTreeComponent)
    if (!entityTree) return console.warn('Entity does not have EntityTreeComponent', entity)

    const parentTransform = entityTree?.parentEntity
      ? getOptionalComponent(entityTree.parentEntity, TransformComponent)
      : undefined
    if (!parentTransform) return console.warn('Entity does not have parent TransformComponent', entity)

    const transform = getComponent(entity, TransformComponent)
    transform.matrix.multiplyMatrices(parentTransform.matrix, component.matrix.value)
    transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
  }
})
