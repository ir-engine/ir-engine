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

import { Intersection, Object3D, Raycaster, Vector2, Vector3 } from 'three'

import { Engine, getComponent } from '@ir-engine/ecs'
import { SnapMode } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getState } from '@ir-engine/hyperflux'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'

import { EditorHelperState } from '../services/EditorHelperState'
import { getIntersectingNodeOnScreen } from './getIntersectingNode'

/**
 * Function provides the screen space position.
 *
 * @param screenSpacePosition
 * @param target
 */
export const getScreenSpacePosition = (() => {
  const raycaster = new Raycaster()
  raycaster.layers.disable(ObjectLayers.Camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.layers.enable(ObjectLayers.Scene)
  const raycastTargets: Intersection<Object3D>[] = []

  return (screenSpacePosition: Vector2, target = new Vector3()): Vector3 => {
    raycastTargets.length = 0
    const editorHelperState = getState(EditorHelperState)
    const closestTarget = getIntersectingNodeOnScreen(raycaster, screenSpacePosition, raycastTargets)

    if (closestTarget && closestTarget.distance < 1000) {
      target.copy(closestTarget.point)
    } else {
      raycaster.ray.at(20, target)
    }

    if (editorHelperState.gridSnap === SnapMode.Grid) {
      const translationSnap = editorHelperState.translationSnap

      target.set(
        Math.round(target.x / translationSnap) * translationSnap,
        Math.round(target.y / translationSnap) * translationSnap,
        Math.round(target.z / translationSnap) * translationSnap
      )
    }

    return target
  }
})()

/**
 * Function provides the postion of object at the center of the scene .
 *
 * @param target
 * @return {any}        [Spwan position]
 */
export const getSpawnPositionAtCenter = (() => {
  const center = new Vector2()
  return (target: Vector3) => {
    return getScreenSpacePosition(center, target)
  }
})()

/**
 * Function provides the cursor spawn position.
 *
 * @param mousePos
 * @param target
 * @returns
 */
export function getCursorSpawnPosition(mousePos: Vector2, target = new Vector3()): Vector3 {
  const rect = getComponent(
    Engine.instance.viewerEntity,
    RendererComponent
  ).renderer!.domElement.getBoundingClientRect()
  const position = new Vector2()
  position.x = ((mousePos.x - rect.left) / rect.width) * 2 - 1
  position.y = ((mousePos.y - rect.top) / rect.height) * -2 + 1
  return getScreenSpacePosition(position, target)
}
