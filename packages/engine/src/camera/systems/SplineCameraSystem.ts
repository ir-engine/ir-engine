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

// @todo delete this whole file

import { Quaternion } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

import {
  defineQuery,
  getComponent,
  getMutableComponent,
  getOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { CameraTrackComponent } from '../../scene/components/CameraTrackComponent'
import { SplineComponent } from '../../scene/components/SplineComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

const query = defineQuery([SplineComponent, CameraTrackComponent, VisibleComponent])

const execute = () => {
  const { deltaSeconds } = Engine.instance

  for (const entity of query.enter()) {
    getMutableComponent(entity, CameraTrackComponent).alpha.set(0)
  }

  /* why add helpers?
  for (const entity of query.enter()) {

    const transform = getComponent(entity, TransformComponent)
    const splineComponent = getOptionalComponent(entity, SplineComponent)
    if(!splineComponent) return

    console.log("SplineCameraHelper: remaking arrows")

    for (let i = 0; i < splineComponent.splineDivisions.length - 1; i++) {
      const division = splineComponent.splineDivisions[i]
      const number = i / ((splineComponent.splineDivisions.length - 1) / (spline.splinePositions.length - 1))
      const pointNumber = Math.floor(number)
      console.log(number, pointNumber)

      const currentRotation = splineComponent.splineRotations[pointNumber] //.clone().multiply(rotneg90x)
      const nextRotation = splineComponent.splineRotations[pointNumber + 1] //.clone().multiply(rotneg90x)

      const helper = new ArrowHelper()

      helper.position.copy(division).add(transform.position)
      helper.quaternion.slerpQuaternions(currentRotation, nextRotation, number - pointNumber)

      helper.updateMatrixWorld(true)
      Engine.instance.scene.add(helper)
    }
  }
  */

  for (const entity of query()) {
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    const transform = getComponent(entity, TransformComponent)
    const cameraTrackComponent = getComponent(entity, CameraTrackComponent)
    const splineComponent = getOptionalComponent(entity, SplineComponent)
    if (!splineComponent) return
    const spline = splineComponent.spline

    cameraTrackComponent.alpha += deltaSeconds * 0.1 // @todo improve
    const alphaIndex = Math.floor(cameraTrackComponent.alpha)

    /*
    if (alphaIndex >= splineComponent.splinePositions.length-1) {
      cameraTrackComponent.alpha = 0
      // @todo rather than simply starting over and hiccuping a frame could smoothly reset using modulo
      return
    }
    const currentPosition = splineComponent.splinePositions[alphaIndex]
    const nextPosition = splineComponent.splinePositions[alphaIndex+1]
    const currentRotation = cameraTrackComponent.pointRotations[alphaIndex]
    const nextRotation = cameraTrackComponent.pointRotations[alphaIndex+1]
*/
    // test - the SplineComponent and CameraTrackComponent don't actually use or set the facade copies of the position and orientation
    // @todo expose the private state
    if (alphaIndex >= spline._splineHelperObjects.length - 1) {
      cameraTrackComponent.alpha = 0
      return
    }
    const currentPosition = spline._splineHelperObjects[alphaIndex].position
    const nextPosition = spline._splineHelperObjects[alphaIndex + 1].position
    const currentRotation = spline._splineHelperObjects[alphaIndex].rotation
    const nextRotation = spline._splineHelperObjects[alphaIndex + 1].rotation

    /** @todo replace naive lerp with a spline division based calculation */

    cameraTransform.position
      .lerpVectors(currentPosition, nextPosition, cameraTrackComponent.alpha - alphaIndex)
      .add(transform.position).y -= 1

    const l = new Quaternion().slerpQuaternions(currentRotation, nextRotation, cameraTrackComponent.alpha - alphaIndex)

    cameraTransform.rotation.copy(l) //.multiply(transform.rotation)
  }
}

export const SplineCameraSystem = defineSystem({ uuid: 'ee.engine.SplineCameraSystem', execute })
