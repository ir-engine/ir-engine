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

import { getMutableState, getState } from '@etherealengine/hyperflux'
import { throttle } from '../../common/functions/FunctionHelpers'
import { getComponent, getMutableComponent, getOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { defineQuery } from '../../ecs/functions/QueryFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PresentationSystemGroup } from '../../ecs/functions/SystemGroups'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { InputState } from '../../input/state/InputState'
import { ActiveOrbitCamera, CameraOrbitComponent } from '../components/CameraOrbitComponent'

let lastZoom = 0

const doZoom = (zoom) => {
  const zoomDelta = typeof zoom === 'number' ? zoom - lastZoom : 0
  lastZoom = zoom
  getMutableComponent(getState(ActiveOrbitCamera), CameraOrbitComponent).zoomDelta.set(zoomDelta)
}

const throttleZoom = throttle(doZoom, 30, { leading: true, trailing: false })
const InputSourceQuery = defineQuery([InputSourceComponent])
const orbitCameraQuery = defineQuery([CameraOrbitComponent])
const execute = () => {
  /**
   * assign active orbit camera based on which input source registers input
   */
  for (const entity of orbitCameraQuery()) {
    const inputEntity = getComponent(entity, CameraOrbitComponent).inputEntity
    const buttons = getOptionalComponent(inputEntity, InputSourceComponent)?.buttons
    if (!buttons) continue
    if (Object.keys(buttons).length > 0) getMutableState(ActiveOrbitCamera).set(entity)
  }

  const cameraOrbitComponent = getMutableComponent(getState(ActiveOrbitCamera), CameraOrbitComponent)
  if (!cameraOrbitComponent.inputEntity.value) cameraOrbitComponent.inputEntity.set(InputSourceQuery()[0])

  const pointerState = getState(InputState).pointerState
  const inputSource = getComponent(cameraOrbitComponent.inputEntity.value, InputSourceComponent)
  const buttons = inputSource.buttons

  const selecting = buttons.PrimaryClick?.pressed
  const zoom = pointerState.scroll.y
  const panning = buttons.AuxiliaryClick?.pressed

  const editorCamera = getMutableComponent(getState(ActiveOrbitCamera), CameraOrbitComponent)

  if (selecting) {
    editorCamera.isOrbiting.set(true)
    const mouseMovement = pointerState.movement
    if (mouseMovement) {
      editorCamera.cursorDeltaX.set(mouseMovement.x)
      editorCamera.cursorDeltaY.set(mouseMovement.y)
    }
  } else if (panning) {
    editorCamera.isPanning.set(true)
    const mouseMovement = pointerState.movement
    if (mouseMovement) {
      editorCamera.cursorDeltaX.set(mouseMovement.x)
      editorCamera.cursorDeltaY.set(mouseMovement.y)
    }
  } else if (zoom) {
    throttleZoom(zoom)
  }
}

export const CameraOrbitSystem = defineSystem({
  uuid: 'ee.engine.CameraOrbitSystem',
  insert: { with: PresentationSystemGroup },
  execute
})
