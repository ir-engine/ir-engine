import { MathUtils, Matrix3, Vector3 } from 'three'

import { FlyControlComponent } from '@etherealengine/engine/src/avatar/components/FlyControlComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
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
  const keys = Engine.instance.buttons
  if (keys.SecondaryClick?.down) onSecondaryClick()
  if (keys.SecondaryClick?.up) onSecondaryReleased()
}

export const EditorFlyControlSystem = defineSystem({
  uuid: 'ee.editor.EditorFlyControlSystem',
  execute
})
