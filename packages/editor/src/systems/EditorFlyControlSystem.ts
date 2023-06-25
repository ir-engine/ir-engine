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

import { MathUtils, Matrix3, Vector3 } from 'three'

import { FlyControlComponent } from '@etherealengine/engine/src/avatar/components/FlyControlComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  getFirstNonCapturedInputSource,
  InputSourceComponent
} from '@etherealengine/engine/src/input/components/InputSourceComponent'
import { dispatchAction } from '@etherealengine/hyperflux'

import { editorCameraCenter } from '../classes/EditorCameraState'
import { EditorHelperAction } from '../services/EditorHelperState'

const tempVec3 = new Vector3()
const normalMatrix = new Matrix3()

const onSecondaryClick = () => {
  if (!hasComponent(Engine.instance.cameraEntity, FlyControlComponent)) {
    setComponent(Engine.instance.cameraEntity, FlyControlComponent, {
      boostSpeed: 4,
      moveSpeed: 4,
      lookSensitivity: 5,
      maxXRotation: MathUtils.degToRad(80)
    })
    dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: true }))
  }
}

const onSecondaryReleased = () => {
  const camera = Engine.instance.camera
  if (hasComponent(Engine.instance.cameraEntity, FlyControlComponent)) {
    const distance = camera.position.distanceTo(editorCameraCenter)
    editorCameraCenter.addVectors(
      camera.position,
      tempVec3.set(0, 0, -distance).applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
    )
    removeComponent(Engine.instance.cameraEntity, FlyControlComponent)
    dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))
  }
}

const execute = () => {
  const nonCapturedInputSource = getFirstNonCapturedInputSource()
  if (!nonCapturedInputSource) return

  const inputSource = getComponent(nonCapturedInputSource, InputSourceComponent)

  if (inputSource.buttons.SecondaryClick?.down) onSecondaryClick()
  if (inputSource.buttons.SecondaryClick?.up) onSecondaryReleased()
}

export const EditorFlyControlSystem = defineSystem({
  uuid: 'ee.editor.EditorFlyControlSystem',
  execute
})
