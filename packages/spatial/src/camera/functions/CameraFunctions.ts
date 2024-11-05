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

import { ComponentType, getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { getState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { Box3, Frustum, Matrix4, PerspectiveCamera, Quaternion, Sphere, Vector3 } from 'three'
import { BoundingBoxComponent, updateBoundingBox } from '../../transform/components/BoundingBoxComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getBoundingBoxVertices } from '../../transform/functions/BoundingBoxFunctions'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { CameraComponent } from '../components/CameraComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

export const setTargetCameraRotation = (entity: Entity, phi: number, theta: number, time = 0.3) => {
  const cameraRotationTransition = getOptionalComponent(entity, TargetCameraRotationComponent) as
    | ComponentType<typeof TargetCameraRotationComponent>
    | undefined
  if (!cameraRotationTransition) {
    setComponent(entity, TargetCameraRotationComponent, {
      phi: phi,
      phiVelocity: { value: 0 },
      theta: theta,
      thetaVelocity: { value: 0 },
      time: time
    })
  } else {
    cameraRotationTransition.phi = phi
    cameraRotationTransition.theta = theta
    cameraRotationTransition.time = time
  }
}

/**
 * Computes the distance and center of the camera required to fit the points in the camera's view
 * @param camera - PerspectiveCamera
 * @param pointsToFocus - Points to fit in the camera's view
 * @param padding - Padding value to fit the points in the camera's view
 */
export function computeCameraDistanceAndCenter(
  camera: PerspectiveCamera,
  pointsToFocus: Vector3[],
  padding: number = 1.1
) {
  // Create a bounding sphere from the points

  //NO IDEA why `new Sphere().setFromPoints(pointsToFocus)` stopped properly calculating a center point after working fine for over a month
  const boundingSphere = new Sphere()
  for (const pt of pointsToFocus) {
    //expandByPoint is a workaround to force calculating a real centerpoint, which stopped working with setFromPoints
    boundingSphere.expandByPoint(pt)
  }
  const center = boundingSphere.center
  const radius = boundingSphere.radius

  // Compute the distance required to fit the sphere in the camera's vertical FOV
  const fov = camera.fov * (Math.PI / 180) // Convert FOV to radians
  // const distance = radius / Math.sin(fov / 2);

  // Calculate the distance needed to fit the object in the camera's view, padding value of 1.1 is a good fit for most cases
  const distance = (radius / 2 / Math.tan(fov / 2)) * padding
  return { distance, center }
}

/**
 * Computes the distance and center of the camera required to fit the box in the camera's view
 * @param camera - PerspectiveCamera
 * @param box - Box3 to fit in the camera's view
 * @param padding - Padding value to fit the box in the camera's view
 */
export function computeCameraDistanceAndCenterFromBox(camera: PerspectiveCamera, box: Box3, padding: number = 1.1) {
  const points = getBoundingBoxVertices(box)
  return computeCameraDistanceAndCenter(camera, points, padding)
}
export function setCameraFocusOnBox(modelEntity: Entity, cameraEntity: Entity) {
  updateBoundingBox(modelEntity)

  const bbox = getComponent(modelEntity, BoundingBoxComponent).box
  const center = bbox.getCenter(new Vector3())

  // Calculate the bounding sphere radius
  const boundingSphere = bbox.getBoundingSphere(new Sphere())
  const radius = boundingSphere.radius

  const camera = getComponent(cameraEntity, CameraComponent)
  const fov = camera.fov * (Math.PI / 180) // convert vertical fov to radians

  // Calculate the camera direction vector with the desired angle offsets
  const angleY = 30 * (Math.PI / 180) // 30 degrees in radians
  const angleX = 15 * (Math.PI / 180) // 15 degrees in radians

  const direction = new Vector3(
    Math.sin(angleY) * Math.cos(angleX),
    Math.sin(angleX),
    Math.cos(angleY) * Math.cos(angleX)
  ).normalize()

  // Calculate the distance from the camera to the bounding sphere such that it fully frames the content
  const distance = radius / Math.sin(fov / 2)

  // Calculate the camera position
  const cameraPosition = direction.multiplyScalar(distance).add(center)

  // Set the camera transform component
  setComponent(cameraEntity, TransformComponent, { position: cameraPosition })
  computeTransformMatrix(cameraEntity)

  // Calculate the quaternion rotation to look at the center
  const lookAtMatrix = new Matrix4()
  lookAtMatrix.lookAt(cameraPosition, center, new Vector3(0, 1, 0))
  const targetRotation = new Quaternion().setFromRotationMatrix(lookAtMatrix)

  // Apply the rotation to the camera's TransfortexturemComponent
  setComponent(cameraEntity, TransformComponent, { rotation: targetRotation })
  computeTransformMatrix(cameraEntity)
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()

  // Update the view camera matrices
  const viewCamera = camera.cameras[0]
  viewCamera.matrixWorld.copy(camera.matrixWorld)
  viewCamera.matrixWorldInverse.copy(camera.matrixWorldInverse)
  viewCamera.projectionMatrix.copy(camera.projectionMatrix)
  viewCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse)
}

const mat4 = new Matrix4()
const frustum = new Frustum()
const worldPosVec3 = new Vector3()

export const inFrustum = (
  entityToCheck: Entity,
  cameraEntity: Entity = getState(EngineState).viewerEntity
): boolean => {
  if (!cameraEntity) return false

  const camera = getComponent(cameraEntity, CameraComponent)

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  TransformComponent.getWorldPosition(entityToCheck, worldPosVec3)
  return frustum.containsPoint(worldPosVec3)
}
