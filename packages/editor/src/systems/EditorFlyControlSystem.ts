import { MathUtils, Matrix3, Vector3 } from 'three'

import { FlyControlComponent } from '@xrengine/engine/src/avatar/components/FlyControlComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { EditorCameraComponent } from '../classes/EditorCameraComponent'
import { SceneState } from '../functions/sceneRenderFunctions'
import { EditorHelperAction } from '../services/EditorHelperState'

export default async function FlyControlSystem(world: World) {
  const tempVec3 = new Vector3()
  const normalMatrix = new Matrix3()

  const onSecondaryClick = () => {
    if (!hasComponent(SceneState.editorEntity, FlyControlComponent)) {
      setComponent(SceneState.editorEntity, FlyControlComponent, {
        boostSpeed: 4,
        moveSpeed: 4,
        lookSensitivity: 5,
        maxXRotation: MathUtils.degToRad(80)
      })
      dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: true }))
    }
  }

  const onSecondaryReleased = () => {
    const camera = Engine.instance.currentWorld.camera
    if (hasComponent(SceneState.editorEntity, FlyControlComponent)) {
      const cameraComponent = getComponent(Engine.instance.currentWorld.cameraEntity, EditorCameraComponent)
      const distance = camera.position.distanceTo(cameraComponent.center)
      cameraComponent.center.addVectors(
        camera.position,
        tempVec3.set(0, 0, -distance).applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
      )
      removeComponent(SceneState.editorEntity, FlyControlComponent)
      dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))
    }
  }

  const execute = () => {
    const keys = world.buttons
    if (keys.SecondaryClick?.down) onSecondaryClick()
    if (keys.SecondaryClick?.up) onSecondaryReleased()
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
