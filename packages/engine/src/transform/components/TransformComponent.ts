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

import { isZero } from '../../common/functions/MathFunctions'
import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
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

export type LocalTransformComponentType = {
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

    /** @todo the rest of this onSet is necessary until #9193 */

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

  getWorldPosition: (entity: Entity, vec3: Vector3) => {
    const transform = getComponent(entity, TransformComponent)
    vec3.x = transform.matrix.elements[12]
    vec3.y = transform.matrix.elements[13]
    vec3.z = transform.matrix.elements[14]
    return vec3
  },

  // this method is essentially equivalent to Matrix4.decompose
  getWorldRotation: (entity: Entity, quaternion: Quaternion) => {
    const transform = getComponent(entity, TransformComponent)
    const te = transform.matrix.elements

    let sx = _v1.set(te[0], te[1], te[2]).length()
    const sy = _v1.set(te[4], te[5], te[6]).length()
    const sz = _v1.set(te[8], te[9], te[10]).length()

    // if determine is negative, we need to invert one scale
    const det = transform.matrix.determinant()
    if (det < 0) sx = -sx

    // scale the rotation part
    _m1.copy(transform.matrix)

    const invSX = 1 / sx
    const invSY = 1 / sy
    const invSZ = 1 / sz

    _m1.elements[0] *= invSX
    _m1.elements[1] *= invSX
    _m1.elements[2] *= invSX

    _m1.elements[4] *= invSY
    _m1.elements[5] *= invSY
    _m1.elements[6] *= invSY

    _m1.elements[8] *= invSZ
    _m1.elements[9] *= invSZ
    _m1.elements[10] *= invSZ

    quaternion.setFromRotationMatrix(_m1)

    return quaternion
  },

  getWorldScale: (entity: Entity, vec3: Vector3) => {
    const transform = getComponent(entity, TransformComponent)
    const te = transform.matrix.elements

    let sx = _v1.set(te[0], te[1], te[2]).length()
    const sy = _v1.set(te[4], te[5], te[6]).length()
    const sz = _v1.set(te[8], te[9], te[10]).length()

    // if determine is negative, we need to invert one scale
    const det = transform.matrix.determinant()
    if (det < 0) sx = -sx

    vec3.x = sx
    vec3.y = sy
    vec3.z = sz

    return vec3
  },

  dirtyTransforms: {} as Record<Entity, boolean>,
  transformsNeedSorting: false
})

const _v1 = new Vector3()
const _m1 = new Matrix4()

export const LocalTransformComponent = defineComponent({
  name: 'LocalTransformComponent',
  jsonID: 'transform',
  schema: TransformSchema,

  onInit: (entity) => {
    const dirtyTransforms = LocalTransformComponent.dirtyTransforms

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
    } as LocalTransformComponentType

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
    TransformComponent.transformsNeedSorting = true

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

    /** @todo the rest of this onSet is necessary until #9193 */

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
  },

  dirtyTransforms: {} as Record<Entity, boolean>
})

export const composeMatrix = (
  entity: Entity,
  Component: typeof TransformComponent | typeof LocalTransformComponent
) => {
  const te = getComponent(entity, Component).matrix.elements

  const x = Component.rotation.x[entity]
  const y = Component.rotation.y[entity]
  const z = Component.rotation.z[entity]
  const w = Component.rotation.w[entity]

  const x2 = x + x,
    y2 = y + y,
    z2 = z + z
  const xx = x * x2,
    xy = x * y2,
    xz = x * z2
  const yy = y * y2,
    yz = y * z2,
    zz = z * z2
  const wx = w * x2,
    wy = w * y2,
    wz = w * z2

  const sx = Component.scale.x[entity]
  const sy = Component.scale.y[entity]
  const sz = Component.scale.z[entity]

  te[0] = (1 - (yy + zz)) * sx
  te[1] = (xy + wz) * sx
  te[2] = (xz - wy) * sx
  te[3] = 0

  te[4] = (xy - wz) * sy
  te[5] = (1 - (xx + zz)) * sy
  te[6] = (yz + wx) * sy
  te[7] = 0

  te[8] = (xz + wy) * sz
  te[9] = (yz - wx) * sz
  te[10] = (1 - (xx + yy)) * sz
  te[11] = 0

  te[12] = Component.position.x[entity]
  te[13] = Component.position.y[entity]
  te[14] = Component.position.z[entity]
  te[15] = 1
}

export const decomposeMatrix = (
  entity: Entity,
  Component: typeof TransformComponent | typeof LocalTransformComponent
) => {
  const matrix = getComponent(entity, Component).matrix
  const te = matrix.elements

  let sx = _v1.set(te[0], te[1], te[2]).length()
  const sy = _v1.set(te[4], te[5], te[6]).length()
  const sz = _v1.set(te[8], te[9], te[10]).length()

  // if determine is negative, we need to invert one scale
  const det = matrix.determinant()
  if (det < 0) sx = -sx

  Component.position.x[entity] = te[12]
  Component.position.y[entity] = te[13]
  Component.position.z[entity] = te[14]

  // scale the rotation part
  _m1.copy(matrix)

  const invSX = 1 / sx
  const invSY = 1 / sy
  const invSZ = 1 / sz

  _m1.elements[0] *= invSX
  _m1.elements[1] *= invSX
  _m1.elements[2] *= invSX

  _m1.elements[4] *= invSY
  _m1.elements[5] *= invSY
  _m1.elements[6] *= invSY

  _m1.elements[8] *= invSZ
  _m1.elements[9] *= invSZ
  _m1.elements[10] *= invSZ

  setFromRotationMatrix(entity, _m1, Component)

  Component.scale.x[entity] = sx
  Component.scale.y[entity] = sy
  Component.scale.z[entity] = sz
}

export const setFromRotationMatrix = (
  entity: Entity,
  m: Matrix4,
  Component: typeof TransformComponent | typeof LocalTransformComponent
) => {
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

  // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

  const te = m.elements,
    m11 = te[0],
    m12 = te[4],
    m13 = te[8],
    m21 = te[1],
    m22 = te[5],
    m23 = te[9],
    m31 = te[2],
    m32 = te[6],
    m33 = te[10],
    trace = m11 + m22 + m33

  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1.0)

    Component.rotation.w[entity] = 0.25 / s
    Component.rotation.x[entity] = (m32 - m23) * s
    Component.rotation.y[entity] = (m13 - m31) * s
    Component.rotation.z[entity] = (m21 - m12) * s
  } else if (m11 > m22 && m11 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33)

    Component.rotation.w[entity] = (m32 - m23) / s
    Component.rotation.x[entity] = 0.25 * s
    Component.rotation.y[entity] = (m12 + m21) / s
    Component.rotation.z[entity] = (m13 + m31) / s
  } else if (m22 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33)

    Component.rotation.w[entity] = (m13 - m31) / s
    Component.rotation.x[entity] = (m12 + m21) / s
    Component.rotation.y[entity] = 0.25 * s
    Component.rotation.z[entity] = (m23 + m32) / s
  } else {
    const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22)

    Component.rotation.w[entity] = (m21 - m12) / s
    Component.rotation.x[entity] = (m13 + m31) / s
    Component.rotation.y[entity] = (m23 + m32) / s
    Component.rotation.z[entity] = 0.25 * s
  }
}
