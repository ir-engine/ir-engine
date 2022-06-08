import { store, useDispatch } from '@xrengine/client-core/src/store'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'

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
  store.dispatch(EditorHelperAction.changedPlayMode(true))
}

export function leavePlayMode(): void {
  Engine.instance.currentWorld.camera.layers.enableAll()

  addInputActionMapping(ActionSets.EDITOR, EditorMapping)

  const dispatch = useDispatch()
  dispatch(EditorHelperAction.changedFlyMode(false))
  removeInputActionMapping(ActionSets.FLY)

  EngineRenderer.instance.renderer.domElement.removeEventListener('click', onClickCanvas)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
  document.exitPointerLock()

  store.dispatch(EditorHelperAction.changedPlayMode(false))
}

function onClickCanvas(): void {
  EngineRenderer.instance.renderer.domElement.requestPointerLock()
}

function onPointerLockChange(): void {
  const dispatch = useDispatch()

  if (document.pointerLockElement === EngineRenderer.instance.renderer.domElement) {
    dispatch(EditorHelperAction.changedFlyMode(true))
    addInputActionMapping(ActionSets.FLY, FlyMapping)

    removeInputActionMapping(ActionSets.EDITOR)
  } else {
    addInputActionMapping(ActionSets.EDITOR, EditorMapping)

    dispatch(EditorHelperAction.changedFlyMode(false))
    removeInputActionMapping(ActionSets.FLY)
  }
}

export function disposePlayModeControls(): void {
  EngineRenderer.instance.renderer.domElement.removeEventListener('click', onClickCanvas)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
}
