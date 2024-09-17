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

import { ComponentType, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { Box3, PerspectiveCamera, Sphere, Vector3 } from 'three'
import { getBoundingBoxVertices } from '../../transform/functions/BoundingBoxFunctions'
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
  const boundingSphere = new Sphere().setFromPoints(pointsToFocus)

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
