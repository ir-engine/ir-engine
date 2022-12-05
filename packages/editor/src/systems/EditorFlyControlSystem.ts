import { useEffect } from 'react'
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
import { ButtonInputState } from '@xrengine/engine/src/input/InputState'
import { dispatchAction, getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { EditorCameraComponent } from '../classes/EditorCameraComponent'
import { SceneState } from '../functions/sceneRenderFunctions'
import { EditorHelperAction } from '../services/EditorHelperState'

export default async function FlyControlSystem(world: World) {
  const tempVec3 = new Vector3()
  const normalMatrix = new Matrix3()
  const buttonInputState = getState(ButtonInputState)

  const reactor = startReactor(() => {
    const state = useHookstate(buttonInputState)

    useEffect(() => {
      console.log(state.value.SecondaryClick)
      if (state.value.SecondaryClick) {
        if (!hasComponent(SceneState.editorEntity, FlyControlComponent)) {
          setComponent(SceneState.editorEntity, FlyControlComponent, {
            boostSpeed: 4,
            moveSpeed: 4,
            lookSensitivity: 5,
            maxXRotation: MathUtils.degToRad(80)
          })
          dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: true }))
        }
      } else {
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
    }, [state.SecondaryClick])

    return null
  })

  const execute = () => {}

  const cleanup = async () => {
    reactor.stop()
  }

  return { execute, cleanup }
}
