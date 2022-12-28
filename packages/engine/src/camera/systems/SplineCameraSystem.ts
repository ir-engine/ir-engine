import * as gl from 'gl-matrix'
import { ArrowHelper, Euler, Plane, Quaternion, Vector3 } from 'three'

import { World } from '@xrengine/engine/src/ecs/classes/World'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_000, V_001, V_010, V_100 } from '../../common/constants/MathConstants'
import { defineQuery, getComponent, getComponentState } from '../../ecs/functions/ComponentFunctions'
import { CameraTrackComponent } from '../../scene/components/CameraTrackComponent'
import { SplineComponent } from '../../scene/components/SplineComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { setComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
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
    const { deltaSeconds } = world
    for (const entity of cameraTrackQuery.enter()) {
      getComponentState(entity, CameraTrackComponent).alpha.set(0)

      // stuff
      const transform = getComponent(entity, TransformComponent)
      const cameraTrack = getComponent(entity, CameraTrackComponent)
      const spline = getComponent(entity, SplineComponent)

      for (let i = 0; i < spline.splineDivisions.length - 1; i++) {
        const division = spline.splineDivisions[i]
        const number = i / ((spline.splineDivisions.length - 1) / (spline.splinePositions.length - 1))
        const pointNumber = Math.floor(number)
        console.log(number, pointNumber)

        const currentRotation = cameraTrack.pointRotations[pointNumber] //.clone().multiply(rotneg90x)
        const nextRotation = cameraTrack.pointRotations[pointNumber + 1] //.clone().multiply(rotneg90x)

        const helper = new ArrowHelper()

        helper.position.copy(division).add(transform.position)
        helper.quaternion.slerpQuaternions(currentRotation, nextRotation, number - pointNumber)

        helper.updateMatrixWorld(true)
        world.scene.add(helper)
      }
    }

    for (const entity of cameraTrackQuery()) {
      const cameraTransform = getComponent(world.cameraEntity, LocalTransformComponent)
      const transform = getComponent(entity, TransformComponent)
      const cameraTrack = getComponent(entity, CameraTrackComponent)
      const spline = getComponent(entity, SplineComponent)

      cameraTrack.alpha += deltaSeconds * 0.1
      if (cameraTrack.alpha > spline.splinePositions.length - 1) cameraTrack.alpha = 0

      const currentPointNumber = Math.floor(cameraTrack.alpha)
      const nextPointNumber = currentPointNumber + 1

      const currentPosition = spline.splinePositions[currentPointNumber]
      const nextPosition = spline.splinePositions[nextPointNumber]

      const currentRotation = cameraTrack.pointRotations[currentPointNumber]
      const nextRotation = cameraTrack.pointRotations[nextPointNumber]

      /** @todo replace naive lerp with a spline division based calculation */

      cameraTransform.position
        .lerpVectors(currentPosition, nextPosition, cameraTrack.alpha - currentPointNumber)
        .add(transform.position).y -= 1

      const l = new Quaternion().slerpQuaternions(currentRotation, nextRotation, cameraTrack.alpha - currentPointNumber)

      cameraTransform.rotation.copy(l) //.multiply(transform.rotation)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
