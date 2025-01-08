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

import { Matrix4, Quaternion, Vector2, Vector3 } from 'three'

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import type { WebContainer3D } from '@ir-engine/xrui'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'

const _size = new Vector2()
const _vec = new Vector3()
const _pos = new Vector3()
const _quat = new Quaternion()
const _forward = new Vector3(0, 0, -1)
const _mat4 = new Matrix4()
const _vec3 = new Vector3()
const SCREEN_SIZE = new Vector2()

export type ContentFitType = 'cover' | 'contain' | 'vertical' | 'horizontal'
export const ContentFitTypeSchema = (init?: ContentFitType) =>
  S.LiteralUnion(['cover', 'contain', 'vertical', 'horizontal'], init ?? 'contain')

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
    camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
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
    camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
  ) => {
    const size = ObjectFitFunctions.computeFrustumSizeAtDistance(distance, camera)
    return ObjectFitFunctions.computeContentFitScale(contentWidth, contentHeight, size.width, size.height, fit)
  },

  snapToSideOfScreen: (
    entity: Entity,
    contentSize: Vector2,
    contentScale: number,
    distance: number,
    horizontalSnap: 'left' | 'right' | 'center' | number, // where number is range from -1 to 1
    verticalSnap: 'top' | 'bottom' | 'center' | number, // where number is range from -1 to 1
    cameraEntity = getState(ReferenceSpaceState).viewerEntity
  ) => {
    const camera = getComponent(cameraEntity, CameraComponent)
    const containerSize = ObjectFitFunctions.computeFrustumSizeAtDistance(distance, camera)
    const screenSize = getComponent(cameraEntity, RendererComponent).renderer!.getSize(SCREEN_SIZE)
    const aspectRatio = screenSize.x / screenSize.y
    const scaleMultiplier = aspectRatio < 1 ? 1 / aspectRatio : 1
    const scale =
      ObjectFitFunctions.computeContentFitScale(
        contentSize.x,
        contentSize.y,
        containerSize.width,
        containerSize.height
      ) *
      contentScale *
      scaleMultiplier
    const transform = getComponent(entity, TransformComponent)
    const screenUnitsX = containerSize.x * 0.5
    const screenUnitsY = containerSize.y * 0.5
    let xOffset = 0
    let yOffset = 0
    if (horizontalSnap === 'left') {
      xOffset = -screenUnitsX + contentSize.x * 0.5 * scale
    } else if (horizontalSnap === 'right') {
      xOffset = screenUnitsX - contentSize.x * 0.5 * scale
    } else if (horizontalSnap === 'center') {
      xOffset = 0
    } else if (typeof horizontalSnap === 'number') {
      if (horizontalSnap < 0) {
        xOffset = screenUnitsX * horizontalSnap + contentSize.x * 0.5 * scale
      } else if (horizontalSnap > 0) {
        xOffset = screenUnitsX * horizontalSnap - contentSize.x * 0.5 * scale
      } else {
        xOffset = 0
      }
    }
    if (verticalSnap === 'top') {
      yOffset = screenUnitsY - contentSize.y * 0.5 * scale
    } else if (verticalSnap === 'bottom') {
      yOffset = -screenUnitsY + contentSize.y * 0.5 * scale
    } else if (verticalSnap === 'center') {
      yOffset = 0
    } else if (typeof verticalSnap === 'number') {
      if (verticalSnap < 0) {
        yOffset = screenUnitsY * verticalSnap + contentSize.y * 0.5 * scale
      } else if (verticalSnap > 0) {
        yOffset = screenUnitsY * verticalSnap - contentSize.y * 0.5 * scale
      } else {
        yOffset = 0
      }
    }

    _mat4.makeTranslation(xOffset, yOffset, -distance).scale(_vec3.set(scale, scale, 1))
    transform.matrixWorld.multiplyMatrices(getComponent(cameraEntity, CameraComponent).matrixWorld, _mat4)
    transform.matrixWorld.decompose(transform.position, transform.rotation, transform.scale)
  },

  attachObjectInFrontOfCamera: (entity: Entity, scale: number, distance: number) => {
    const transform = getComponent(entity, TransformComponent)
    _mat4.makeTranslation(0, 0, -distance).scale(_vec3.set(scale, scale, 1))
    transform.matrixWorld.multiplyMatrices(
      getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent).matrixWorld,
      _mat4
    )
    transform.matrixWorld.decompose(transform.position, transform.rotation, transform.scale)
  },

  lookAtCameraFromPosition: (container: WebContainer3D, position: Vector3) => {
    const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
    container.scale.setScalar(Math.max(1, camera.position.distanceTo(position) / 3))
    container.position.copy(position)
    container.rotation.setFromRotationMatrix(camera.matrixWorld)
  }
}
