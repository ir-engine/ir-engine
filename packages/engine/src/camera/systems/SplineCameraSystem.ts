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

import { ArrowHelper, Quaternion } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { defineQuery, getComponent, getMutableComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { CameraTrackComponent } from '../../scene/components/CameraTrackComponent'
import { SplineComponent } from '../../scene/components/SplineComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'

const cameraTrackQuery = defineQuery([SplineComponent, CameraTrackComponent, VisibleComponent])

const execute = () => {
  const { deltaSeconds } = Engine.instance
  for (const entity of cameraTrackQuery.enter()) {
    getMutableComponent(entity, CameraTrackComponent).alpha.set(0)

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
      Engine.instance.scene.add(helper)
    }
  }

  for (const entity of cameraTrackQuery()) {
    const cameraTransform = getComponent(Engine.instance.cameraEntity, LocalTransformComponent)
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

export const SplineCameraSystem = defineSystem({ uuid: 'ee.engine.SplineCameraSystem', execute })
