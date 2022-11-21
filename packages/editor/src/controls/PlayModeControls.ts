import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { dispatchAction } from '@xrengine/hyperflux'

import { EditorHelperAction } from '../services/EditorHelperState'

export function enterPlayMode(): void {
  // executeCommandWithHistory({ type: EditorCommands.REPLACE_SELECTION, affectedNodes: [] })
  Engine.instance.currentWorld.camera.layers.set(ObjectLayers.Scene)

  EngineRenderer.instance.renderer.domElement.addEventListener('click', onClickCanvas)
  document.addEventListener('pointerlockchange', onPointerLockChange)
  dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: true }))
}

export function leavePlayMode(): void {
  Engine.instance.currentWorld.camera.layers.enableAll()

  dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))

  EngineRenderer.instance.renderer.domElement.removeEventListener('click', onClickCanvas)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
  document.exitPointerLock()

  dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: false }))
}

function onClickCanvas(): void {
  EngineRenderer.instance.renderer.domElement.requestPointerLock()
}

function onPointerLockChange(): void {
  if (document.pointerLockElement === EngineRenderer.instance.renderer.domElement) {
    dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: true }))
  } else {
    dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))
  }
}

export function disposePlayModeControls(): void {
  EngineRenderer.instance.renderer.domElement.removeEventListener('click', onClickCanvas)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
}
