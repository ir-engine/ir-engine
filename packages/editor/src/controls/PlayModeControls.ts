import { store, useDispatch } from '@xrengine/client-core/src/store'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'

import { executeCommandWithHistory } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { addInputActionMapping, removeInputActionMapping } from '../functions/parseInputActionMapping'
import { EditorHelperAction } from '../services/EditorHelperState'
import { ActionSets, EditorMapping, FlyMapping } from './input-mappings'

export function enterPlayMode(): void {
  executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
  Engine.camera.layers.set(ObjectLayers.Scene)

  Engine.renderer.domElement.addEventListener('click', onClickCanvas)
  document.addEventListener('pointerlockchange', onPointerLockChange)
  store.dispatch(EditorHelperAction.changedPlayMode(true))
}

export function leavePlayMode(): void {
  Engine.camera.layers.enableAll()

  addInputActionMapping(ActionSets.EDITOR, EditorMapping)

  const dispatch = useDispatch()
  dispatch(EditorHelperAction.changedFlyMode(false))
  removeInputActionMapping(ActionSets.FLY)

  Engine.renderer.domElement.removeEventListener('click', onClickCanvas)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
  document.exitPointerLock()

  store.dispatch(EditorHelperAction.changedPlayMode(false))
}

function onClickCanvas(): void {
  Engine.renderer.domElement.requestPointerLock()
}

function onPointerLockChange(): void {
  const dispatch = useDispatch()

  if (document.pointerLockElement === Engine.renderer.domElement) {
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
  Engine.renderer.domElement.removeEventListener('click', onClickCanvas)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
}
