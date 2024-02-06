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

import { useEffect } from 'react'
import { Intersection, Layers, Object3D, Raycaster } from 'three'

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { TransformMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { PresentationSystemGroup } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { SceneSnapshotAction, SceneState } from '@etherealengine/engine/src/scene/Scene'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import {
  ActiveOrbitCamera,
  CameraOrbitComponent
} from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { InfiniteGridComponent } from '@etherealengine/spatial/src/renderer/components/InfiniteGridHelper'
import { TransformGizmoComponent } from '../classes/TransformGizmoComponent'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { addMediaNode } from '../functions/addMediaNode'
import isInputSelected from '../functions/isInputSelected'
import {
  setTransformMode,
  toggleSnapMode,
  toggleTransformPivot,
  toggleTransformSpace
} from '../functions/transformFunctions'
import { EditorErrorState } from '../services/EditorErrorServices'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
import { ObjectGridSnapState } from './ObjectGridSnapSystem'

const raycaster = new Raycaster()
const raycasterResults: Intersection<Object3D>[] = []
let primaryClickAccum = 0

const onKeyB = () => {
  getMutableState(ObjectGridSnapState).enabled.set(!getState(ObjectGridSnapState).enabled)
}

const onKeyF = () => {
  getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent).focusedEntities.set(
    SelectionState.getSelectedEntities()
  )
}

const onKeyQ = () => {
  /*const nodes = SelectionState.getSelectedEntities()
  const gizmoTransform = getComponent(gizmoEntity, TransformComponent)
  const editorHelperState = getState(EditorHelperState)
  EditorControlFunctions.rotateAround(
    nodes,
    V_010,
    editorHelperState.rotationSnap * MathUtils.DEG2RAD,
    gizmoTransform.position
  )*/
}

const onKeyE = () => {
  /*const nodes = SelectionState.getSelectedEntities()
  const gizmoTransform = getComponent(gizmoEntity, TransformComponent)
  const editorHelperState = getState(EditorHelperState)
  EditorControlFunctions.rotateAround(
    nodes,
    V_010,
    -editorHelperState.rotationSnap * MathUtils.DEG2RAD,
    gizmoTransform.position
  )*/
}
const onEscape = () => {
  EditorControlFunctions.replaceSelection([])
}

const onKeyT = () => {
  setTransformMode(TransformMode.translate)
}

const onKeyR = () => {
  setTransformMode(TransformMode.rotate)
}

const onKeyY = () => {
  setTransformMode(TransformMode.scale)
}

const onKeyC = () => {
  toggleSnapMode()
}

const onKeyX = () => {
  toggleTransformPivot()
}

const onKeyZ = (control: boolean, shift: boolean) => {
  if (control) {
    const state = getState(SceneState).scenes[getState(SceneState).activeScene!]
    if (shift) {
      if (state.index >= state.snapshots.length - 1) return
      dispatchAction(SceneSnapshotAction.redo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    } else {
      if (state.index <= 0) return
      dispatchAction(SceneSnapshotAction.undo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    }
  } else {
    toggleTransformSpace()
  }
}

const onEqual = () => {
  const rendererState = useHookstate(getMutableState(RendererState))
  rendererState.gridHeight.set(rendererState.gridHeight.value + 1)
}

const onMinus = () => {
  const rendererState = useHookstate(getMutableState(RendererState))
  rendererState.gridHeight.set(rendererState.gridHeight.value - 1)
}

const onDelete = () => {
  EditorControlFunctions.removeObject(SelectionState.getSelectedEntities())
}

function copy(event) {
  if (isInputSelected()) return
  event.preventDefault()

  // TODO: Prevent copying objects with a disabled transform
  if (getState(SelectionState).selectedEntities.length > 0) {
    event.clipboardData.setData(
      'application/vnd.editor.nodes',
      JSON.stringify({ entities: getState(SelectionState).selectedEntities })
    )
  }
}

const inputSourceQuery = defineQuery([InputSourceComponent])

function paste(event) {
  if (isInputSelected()) return

  const isMiddleClick = inputSourceQuery().find((e) => getComponent(e, InputSourceComponent).buttons.AuxiliaryClick)
  if (isMiddleClick) return

  event.preventDefault()

  let data

  if ((data = event.clipboardData.getData('application/vnd.editor.nodes')) !== '') {
    const { entities } = JSON.parse(data)

    if (!Array.isArray(entities)) return
    const nodes = entities.filter((entity) => hasComponent(entity, EntityTreeComponent))

    if (nodes) {
      EditorControlFunctions.duplicateObject(nodes)
    }
  } else if ((data = event.clipboardData.getData('text')) !== '') {
    try {
      const url = new URL(data)
      addMediaNode(url.href).catch((error) => getMutableState(EditorErrorState).error.set(error))
    } catch (e) {
      console.warn('Clipboard contents did not contain a valid url')
    }
  }
}

const findIntersectObjects = (object: Object3D, excludeObjects?: Object3D[], excludeLayers?: Layers): void => {
  if (
    (excludeObjects && excludeObjects.indexOf(object) !== -1) ||
    (excludeLayers && excludeLayers.test(object.layers)) ||
    !object.visible
  ) {
    return
  }

  raycaster.intersectObject(object, false, raycasterResults)

  for (let i = 0; i < object.children.length; i++) {
    findIntersectObjects(object.children[i], excludeObjects, excludeLayers)
  }
}

const inputQuery = defineQuery([InputSourceComponent])

const execute = () => {
  if (Engine.instance.localClientEntity) return // we are in live mode
  const deltaSeconds = getState(ECSState).deltaSeconds

  const editorHelperState = getState(EditorHelperState)
  const selectedEntities = SelectionState.getSelectedEntities()

  const inputSource = getComponent(inputQuery()[0], InputSourceComponent)
  const buttons = inputSource.buttons

  if (editorHelperState.isFlyModeEnabled) return

  if (buttons.KeyB?.down) onKeyB()

  if (buttons.KeyQ?.down) onKeyQ()
  if (buttons.KeyE?.down) onKeyE()
  if (buttons.KeyT?.down) onKeyT()
  if (buttons.KeyR?.down) onKeyR()
  if (buttons.KeyY?.down) onKeyY()
  if (buttons.KeyC?.down) onKeyC()
  if (buttons.KeyX?.down) onKeyX()
  if (buttons.KeyF?.down) onKeyF()
  if (buttons.KeyZ?.down) onKeyZ(!!buttons.ControlLeft?.pressed, !!buttons.ShiftLeft?.pressed)
  if (buttons.Equal?.down) onEqual()
  if (buttons.Minus?.down) onMinus()
  if (buttons.Delete?.down) onDelete()

  if (selectedEntities) {
    const lastSelection = selectedEntities[selectedEntities.length - 1]
    if (hasComponent(lastSelection, TransformGizmoComponent)) {
      // dont let use the editor camera while dragging
      const mainOrbitCamera = getOptionalMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
      if (mainOrbitCamera) mainOrbitCamera.disabled.set(getComponent(lastSelection, TransformGizmoComponent).dragging)
    }
  }

  if (buttons.PrimaryClick?.pressed) {
    primaryClickAccum += deltaSeconds
  }
  if (buttons.PrimaryClick?.up) {
    primaryClickAccum = 0
  }
  if (primaryClickAccum <= 0.2) {
    if (buttons.PrimaryClick?.up && inputSource.assignedButtonEntity) {
      let clickedEntity = inputSource.assignedButtonEntity
      while (
        !hasComponent(clickedEntity, SourceComponent) &&
        getOptionalComponent(clickedEntity, EntityTreeComponent)?.parentEntity
      ) {
        clickedEntity = getComponent(clickedEntity, EntityTreeComponent).parentEntity!
      }
      if (hasComponent(clickedEntity, SourceComponent)) {
        SelectionState.updateSelection([getComponent(clickedEntity, UUIDComponent)])
      }
    }
  }
}

const gizmoQuery = defineQuery([TransformGizmoComponent])

const reactor = () => {
  const selectedEntities = SelectionState.useSelectedEntities()
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const rendererState = useHookstate(getMutableState(RendererState))

  useEffect(() => {
    // todo figure out how to do these with our input system
    window.addEventListener('copy', copy)
    window.addEventListener('paste', paste)

    return () => {
      window.removeEventListener('copy', copy)
      window.removeEventListener('paste', paste)
    }
  }, [])

  useEffect(() => {
    if (!selectedEntities.length) return

    for (const entity of gizmoQuery()) {
      removeComponent(entity, TransformGizmoComponent)
    }
    const lastSelection = selectedEntities[selectedEntities.length - 1]
    if (!lastSelection) return

    setComponent(lastSelection, TransformGizmoComponent)
  }, [selectedEntities])

  useEffect(() => {
    // set the active orbit camera to the main camera
    setComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
    getMutableState(ActiveOrbitCamera).set(Engine.instance.cameraEntity)
  }, [])

  useEffect(() => {
    const infiniteGridHelperEntity = rendererState.infiniteGridHelperEntity.value
    if (!infiniteGridHelperEntity) return
    setComponent(infiniteGridHelperEntity, InfiniteGridComponent, { size: editorHelperState.translationSnap.value })
  }, [editorHelperState.translationSnap, rendererState.infiniteGridHelperEntity])

  return null
}

export const EditorControlSystem = defineSystem({
  uuid: 'ee.editor.EditorControlSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
