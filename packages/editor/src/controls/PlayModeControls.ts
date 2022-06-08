import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommandWithHistory } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { addInputActionMapping, removeInputActionMapping } from '../functions/parseInputActionMapping'
import { EditorHelperAction } from '../services/EditorHelperState'
import { ActionSets, EditorMapping, FlyMapping } from './input-mappings'

export function enterPlayMode(): void {
  executeCommandWithHistory({ type: EditorCommands.REPLACE_SELECTION, affectedNodes: [] })
  Engine.instance.currentWorld.camera.layers.set(ObjectLayers.Scene)

  EngineRenderer.instance.renderer.domElement.addEventListener('click', onClickCanvas)
  document.addEventListener('pointerlockchange', onPointerLockChange)
  dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: true }))
}

export function leavePlayMode(): void {
  Engine.instance.currentWorld.camera.layers.enableAll()

  addInputActionMapping(ActionSets.EDITOR, EditorMapping)

  dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))
  removeInputActionMapping(ActionSets.FLY)

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
    addInputActionMapping(ActionSets.FLY, FlyMapping)

    removeInputActionMapping(ActionSets.EDITOR)
  } else {
    addInputActionMapping(ActionSets.EDITOR, EditorMapping)

    dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))
    removeInputActionMapping(ActionSets.FLY)
  }
}

export function disposePlayModeControls(): void {
  EngineRenderer.instance.renderer.domElement.removeEventListener('click', onClickCanvas)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
}
