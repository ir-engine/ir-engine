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

import { MathUtils, Vector3 } from 'three'

import { getComponent, hasComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getMutableState } from '@etherealengine/hyperflux'
import { FlyControlComponent } from '@etherealengine/spatial/src/camera/components/FlyControlComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'

import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { EditorHelperState } from '../services/EditorHelperState'

const center = new Vector3()
const directionToCenter = new Vector3()
const onSecondaryClick = () => {
  if (!hasComponent(Engine.instance.cameraEntity, FlyControlComponent)) {
    setComponent(Engine.instance.cameraEntity, FlyControlComponent, {
      boostSpeed: 4,
      moveSpeed: 4,
      lookSensitivity: 5,
      maxXRotation: MathUtils.degToRad(80)
    })
    getMutableState(EditorHelperState).isFlyModeEnabled.set(true)
  }
}

const onSecondaryReleased = () => {
  const transform = getComponent(Engine.instance.cameraEntity, TransformComponent)
  if (hasComponent(Engine.instance.cameraEntity, FlyControlComponent)) {
    const editorCameraCenter = getComponent(Engine.instance.cameraEntity, CameraOrbitComponent).cameraOrbitCenter
    center.subVectors(transform.position, editorCameraCenter)
    const centerLength = center.length()
    editorCameraCenter.copy(transform.position)
    editorCameraCenter.add(directionToCenter.set(0, 0, -centerLength).applyQuaternion(transform.rotation))

    removeComponent(Engine.instance.cameraEntity, FlyControlComponent)
    getMutableState(EditorHelperState).isFlyModeEnabled.set(false)
  }
}

const execute = () => {
  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSourceQuery()[0]
  if (!nonCapturedInputSource) return

  const inputSource = getComponent(nonCapturedInputSource, InputSourceComponent)

  if (inputSource.buttons.SecondaryClick?.down) onSecondaryClick()
  if (inputSource.buttons.SecondaryClick?.up) onSecondaryReleased()
}

export const EditorFlyControlSystem = defineSystem({
  uuid: 'ee.editor.EditorFlyControlSystem',
  insert: { before: PresentationSystemGroup },
  execute
})
