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
