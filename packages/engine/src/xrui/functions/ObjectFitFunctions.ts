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

import { Matrix4, Quaternion, Vector2, Vector3 } from 'three'

import type { WebContainer3D } from '@etherealengine/xrui'

import { AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { Object3DUtils } from '../../common/functions/Object3DUtils'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

const _size = new Vector2()
const _vec = new Vector3()
const _pos = new Vector3()
const _quat = new Quaternion()
const _forward = new Vector3(0, 0, -1)
const _mat4 = new Matrix4()
const _vec3 = new Vector3()

export type ContentFitType = 'cover' | 'contain' | 'vertical' | 'horizontal'

// yes, multiple by the same direction twice, as the local coordinate changes with each rotation
const _handRotation = new Quaternion()
  .setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))

export const ObjectFitFunctions = {
  computeContentFitScale: (
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number,
    fit: ContentFitType = 'contain'
  ) => {
    const ratioContent = contentWidth / contentHeight
    const ratioContainer = containerWidth / containerHeight

    const useHeight =
      fit === 'cover'
        ? ratioContent > ratioContainer
        : fit === 'contain'
        ? ratioContent < ratioContainer
        : fit === 'vertical'
        ? true
        : false

    let scale = 1
    if (useHeight) {
      scale = containerHeight / contentHeight
    } else {
      scale = containerWidth / contentWidth
    }

    return scale
  },

  computeFrustumSizeAtDistance: (
    distance: number,
    camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  ) => {
    // const vFOV = camera.fov * DEG2RAD
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
    const inverseProjection = camera.projectionMatrixInverse
    const topRadians = _vec.set(0, 1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const bottomRadians = _vec.set(0, -1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const vFOV = topRadians + bottomRadians
    const height = Math.tan(vFOV / 2) * Math.abs(distance) * 2
    const width = height * camera.aspect
    return _size.set(width, height)
  },

  computeContentFitScaleForCamera: (
    distance: number,
    contentWidth: number,
    contentHeight: number,
    fit: ContentFitType = 'contain',
    camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  ) => {
    const size = ObjectFitFunctions.computeFrustumSizeAtDistance(distance, camera)
    return ObjectFitFunctions.computeContentFitScale(contentWidth, contentHeight, size.width, size.height, fit)
  },

  attachObjectInFrontOfCamera: (entity: Entity, scale: number, distance: number) => {
    const transform = getComponent(entity, TransformComponent)
    _mat4.makeTranslation(0, 0, -distance).scale(_vec3.set(scale, scale, 1))
    transform.matrix.multiplyMatrices(getComponent(Engine.instance.cameraEntity, CameraComponent).matrixWorld, _mat4)
    transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
    transform.matrixInverse.copy(transform.matrix).invert()
    TransformComponent.dirtyTransforms[entity] = false
  },

  attachObjectToHand: (container: WebContainer3D, scale: number) => {
    const { localClientEntity } = Engine.instance
    const avatarAnimationComponent = getComponent(localClientEntity, AvatarRigComponent)
    if (avatarAnimationComponent && avatarAnimationComponent.rig.LeftHand) {
      // todo: figure out how to scale this properly
      // container.scale.x = container.scale.y = 0.5 * scale
      // todo: use handedness option to settings
      if (container.parent !== Engine.instance.scene) {
        container.removeFromParent()
        Engine.instance.scene.add(container)
      }

      _pos.copy(avatarAnimationComponent.rig.LeftHand.position)
      _pos.x -= 0.1
      _pos.y -= 0.1
      container.position.copy(avatarAnimationComponent.rig.LeftHand.localToWorld(_pos))
      container.quaternion
        .set(0, 0, 0, 1)
        .multiply(Object3DUtils.getWorldQuaternion(avatarAnimationComponent.rig.LeftHand, _quat))
        .multiply(_handRotation)
      container.updateMatrixWorld(true)
    }
  },

  lookAtCameraFromPosition: (container: WebContainer3D, position: Vector3) => {
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    container.scale.setScalar(Math.max(1, camera.position.distanceTo(position) / 3))
    container.position.copy(position)
    container.rotation.setFromRotationMatrix(camera.matrixWorld)
  }
}
