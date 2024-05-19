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

import { Matrix4, Mesh, Quaternion, Vector3 } from 'three'

import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'

import { TransformComponent } from '../../transform/components/TransformComponent'

/**
 * Applies an entity's transform component to a base mesh
 * @param {Entity} entity
 * @param {Mesh} mesh
 */

export function applyTransformToMesh(entity: Entity, mesh: Mesh) {
  const transform = getComponent(entity, TransformComponent)
  mesh.updateMatrixWorld(true)
  const position = new Vector3()
    .copy(mesh.position)
    .applyQuaternion(transform.rotation)
    .multiply(transform.scale)
    .add(transform.position)
  const quaternion = new Quaternion().setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transform.rotation),
      new Matrix4().makeRotationFromQuaternion(mesh.quaternion)
    )
  )
  const scale = new Vector3().copy(mesh.scale).multiply(transform.scale)

  mesh.position.copy(position)
  mesh.quaternion.copy(quaternion)
  mesh.scale.copy(scale)
}
/**
 * Applies an entity's transform component to a child mesh in world position
 * @param {Entity} entity
 * @param {Mesh} mesh
 */

export function applyTransformToMeshWorld(entity: Entity, mesh: Mesh) {
  const transform = getComponent(entity, TransformComponent)
  mesh.updateMatrixWorld(true)
  const [position, quaternion, scale] = getTransform(
    mesh.getWorldPosition(new Vector3()),
    mesh.getWorldQuaternion(new Quaternion()),
    mesh.getWorldScale(new Vector3()),
    transform.position,
    transform.rotation,
    transform.scale
  )
  mesh.position.copy(position)
  mesh.quaternion.copy(quaternion)
  mesh.scale.copy(scale)
}

/**
 * Returns the result of applying a transform to another transform
 * @param {Entity} entity
 * @param {Mesh} mesh
 * @returns {[Vector3, Quaternion, Vector3]}
 */

export function getTransform(posM, queM, scaM, posE, queE, scaE): [Vector3, Quaternion, Vector3] {
  const quaternionM = new Quaternion(queM.x, queM.y, queM.z, queM.w)
  const quaternionE = new Quaternion(queE.x, queE.y, queE.z, queE.w)
  const position = new Vector3().set(posM.x, posM.y, posM.z).applyQuaternion(quaternionE)
  const quaternion = new Quaternion()
  const scale = new Vector3()
  position.x = position.x * scaE.x + posE.x
  position.y = position.y * scaE.y + posE.y
  position.z = position.z * scaE.z + posE.z
  quaternion.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(quaternionE),
      new Matrix4().makeRotationFromQuaternion(quaternionM)
    )
  )
  scale.x = scaM.x * scaE.x
  scale.y = scaM.y * scaE.y
  scale.z = scaM.z * scaE.z
  return [position, quaternion, scale]
}
