import * as gl from 'gl-matrix'
import { Euler, Plane, Quaternion, Vector3 } from 'three'

import { World } from '@xrengine/engine/src/ecs/classes/World'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_000, V_001, V_010, V_100 } from '../../common/constants/MathConstants'
import { defineQuery, getComponent, getComponentState } from '../../ecs/functions/ComponentFunctions'
import { CameraTrackComponent } from '../../scene/components/CameraTrackComponent'
import { SplineComponent } from '../../scene/components/SplineComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'

export default async function SplineCameraSystem(world: World) {
  const cameraTrackQuery = defineQuery([SplineComponent, CameraTrackComponent, VisibleComponent])

  const rotneg90x = new Quaternion().setFromAxisAngle(V_100, -Math.PI / 2)

  let dualQuaternionFrom = gl.quat2.create()
  let dualQuaternionTo = gl.quat2.create()
  const dualQuaternionOut = gl.quat2.create()
  const vec3 = gl.vec3.create()
  const quat = gl.quat.create()

  const execute = () => {
    // return
    const { deltaSeconds } = world
    for (const entity of cameraTrackQuery.enter()) {
      getComponentState(entity, CameraTrackComponent).alpha.set(0)
    }

    for (const entity of cameraTrackQuery()) {
      const cameraTransform = getComponent(world.cameraEntity, LocalTransformComponent)

      const transform = getComponent(entity, TransformComponent)

      const cameraTrack = getComponent(entity, CameraTrackComponent)
      const spline = getComponent(entity, SplineComponent)

      cameraTrack.alpha += deltaSeconds
      if (cameraTrack.alpha > spline.splinePositions.length - 1) cameraTrack.alpha = 0

      const currentPointNumber = Math.floor(cameraTrack.alpha)
      const nextPointNumber = currentPointNumber + 1

      const currentPosition = spline.splinePositions[currentPointNumber]
      const nextPosition = spline.splinePositions[nextPointNumber]

      const currentRotation = cameraTrack.pointRotations[currentPointNumber].clone().multiply(rotneg90x)
      const nextRotation = cameraTrack.pointRotations[nextPointNumber].clone().multiply(rotneg90x)

      /** @todo replace naive lerp with a spline division based calculation */

      // dualQuaternionFrom = gl.quat2.fromRotationTranslationValues(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w, currentPosition.x, currentPosition.y, currentPosition.z)
      // dualQuaternionTo = gl.quat2.fromRotationTranslationValues(nextRotation.x, nextRotation.y, nextRotation.z, nextRotation.w, nextPosition.x, nextPosition.y, nextPosition.z)

      // gl.quat2.lerp(dualQuaternionOut, dualQuaternionFrom, dualQuaternionTo, cameraTrack.alpha - currentPointNumber)

      // gl.quat2.getTranslation(vec3, dualQuaternionOut)
      // cameraTransform.position.fromArray(vec3).add(transform.position)

      // gl.quat2.getReal(quat, dualQuaternionOut as any)
      // cameraTransform.rotation.copy(rotneg90x).multiply(new Quaternion().fromArray(quat))//.fromArray(quat)

      cameraTransform.position
        .lerpVectors(currentPosition, nextPosition, cameraTrack.alpha - currentPointNumber)
        .add(transform.position)

      cameraTransform.rotation.slerpQuaternions(currentRotation, nextRotation, cameraTrack.alpha - currentPointNumber) //.invert().multiply(transform.rotation)

      /** remove roll from camera */
      // if (cameraTrack.disableRoll) {
      //   euler.setFromQuaternion(camera.rotation)
      //   camera.rotation.setFromEuler(euler)
      // }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
