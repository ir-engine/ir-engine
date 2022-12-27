import { Euler, Plane, Quaternion, Vector3 } from 'three'

import { World } from '@xrengine/engine/src/ecs/classes/World'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_000, V_001, V_010 } from '../../common/constants/MathConstants'
import { defineQuery, getComponent, getComponentState } from '../../ecs/functions/ComponentFunctions'
import { CameraTrackComponent } from '../../scene/components/CameraTrackComponent'
import { SplineComponent } from '../../scene/components/SplineComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'

export default async function SplineCameraSystem(world: World) {
  const cameraTrackQuery = defineQuery([SplineComponent, CameraTrackComponent, VisibleComponent])

  const euler = new Euler()
  const quat1 = new Quaternion()
  const quat2 = new Quaternion()
  const forward1 = new Vector3()
  const forward2 = new Vector3()

  const execute = () => {
    const { deltaSeconds } = world
    for (const entity of cameraTrackQuery.enter()) {
      getComponentState(entity, CameraTrackComponent).alpha.set(0)
    }

    for (const entity of cameraTrackQuery()) {
      const camera = getComponent(world.cameraEntity, LocalTransformComponent)

      const transform = getComponent(entity, TransformComponent)

      const cameraTrack = getComponent(entity, CameraTrackComponent)
      const spline = getComponent(entity, SplineComponent)

      cameraTrack.alpha += deltaSeconds
      if (cameraTrack.alpha > spline.splinePositions.length - 1) cameraTrack.alpha = 0

      const currentPointNumber = Math.floor(cameraTrack.alpha)
      const nextPointNumber = currentPointNumber + 1

      const currentPosition = spline.splinePositions[currentPointNumber]
      const nextPosition = spline.splinePositions[nextPointNumber]

      const currentRotation = cameraTrack.pointRotations[currentPointNumber]
      const nextRotation = cameraTrack.pointRotations[nextPointNumber]

      /** @todo replace naive lerp with a velocity based calculation */

      camera.position
        .lerpVectors(currentPosition, nextPosition, cameraTrack.alpha - currentPointNumber)
        .add(transform.position)
      camera.rotation.fastSlerpQuaternions(currentRotation, nextRotation, cameraTrack.alpha - currentPointNumber) //.invert().multiply(transform.rotation)

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
