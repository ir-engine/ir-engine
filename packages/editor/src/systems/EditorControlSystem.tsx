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

import React, { useEffect } from 'react'
import { Intersection, Layers, Object3D, Raycaster, Vector2, Vector3 } from 'three'

import { throttle } from '@etherealengine/engine/src/common/functions/FunctionHelpers'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useQuery
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { InputComponent } from '@etherealengine/engine/src/input/components/InputComponent'
import { InputSourceComponent } from '@etherealengine/engine/src/input/components/InputSourceComponent'
import InfiniteGridHelper from '@etherealengine/engine/src/scene/classes/InfiniteGridHelper'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import {
  TransformMode,
  TransformModeType,
  TransformPivotType,
  TransformSpaceType
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { SceneSnapshotAction, SceneSnapshotSystem, SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { InputState } from '@etherealengine/engine/src/input/state/InputState'
import { EditorCameraState } from '../classes/EditorCameraState'
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
import { EditorSelectionReceptorSystem, SelectionState } from '../services/SelectionServices'

const raycaster = new Raycaster()
const raycasterResults: Intersection<Object3D>[] = []
const raycastIgnoreLayers = new Layers()

const isMacOS = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
let lastZoom = 0
let prevRotationAngle = 0

let selectedEntities: Entity[]
let selectedParentEntities: Entity[]
let lastSelectedEntities = [] as Entity[]
// let gizmoObj: TransformGizmo
let transformMode: TransformModeType
let transformPivot: TransformPivotType
let transformSpace: TransformSpaceType
let transformModeChanged = false
let transformPivotChanged = false
let transformSpaceChanged = false
let dragging = false

const onKeyQ = () => {
  /*const nodes = getState(SelectionState).selectedEntities
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
  /*const nodes = getState(SelectionState).selectedEntities
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
const onKeyF = () => {
  const editorCameraState = getMutableState(EditorCameraState)
  editorCameraState.focusedObjects.set(selectedEntities)
  editorCameraState.refocus.set(true)
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
  InfiniteGridHelper.instance.incrementGridHeight()
}

const onMinus = () => {
  InfiniteGridHelper.instance.decrementGridHeight()
}

const onDelete = () => {
  EditorControlFunctions.removeObject(getState(SelectionState).selectedEntities)
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

const getRaycastPosition = (coords: Vector2, target: Vector3, snapAmount = 0): void => {
  raycaster.setFromCamera(coords, getComponent(Engine.instance.cameraEntity, CameraComponent))
  raycasterResults.length = 0
  raycastIgnoreLayers.set(1)
  const scene = Engine.instance.scene

  const excludeObjects = [] as Object3D[]
  const selectionState = getState(SelectionState)
  for (const e of selectionState.selectedParentEntities) {
    const group = getComponent(e, GroupComponent)
    if (group) excludeObjects.push(...group)
  }

  findIntersectObjects(Engine.instance.scene, excludeObjects, raycastIgnoreLayers)
  findIntersectObjects(InfiniteGridHelper.instance)

  raycasterResults.sort((a, b) => a.distance - b.distance)
  if (raycasterResults[0] && raycasterResults[0].distance < 100) target.copy(raycasterResults[0].point)
  else raycaster.ray.at(10, target)

  if (snapAmount) {
    target.set(
      Math.round(target.x / snapAmount) * snapAmount,
      Math.round(target.y / snapAmount) * snapAmount,
      Math.round(target.z / snapAmount) * snapAmount
    )
  }
}

const compareArrays = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

const doZoom = (zoom) => {
  const zoomDelta = typeof zoom === 'number' ? zoom - lastZoom : 0
  lastZoom = zoom
  getMutableState(EditorCameraState).zoomDelta.set(zoomDelta)
}

const throttleZoom = throttle(doZoom, 30, { leading: true, trailing: false })

const execute = () => {
  if (Engine.instance.localClientEntity) return // we are in live mode

  const editorHelperState = getState(EditorHelperState)
  const selectionState = getMutableState(SelectionState)
  const pointerState = getState(InputState).pointerState

  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSourceQuery()[0]
  if (!nonCapturedInputSource) return

  const inputSource = getComponent(nonCapturedInputSource, InputSourceComponent)
  const buttons = inputSource.buttons

  if (editorHelperState.isFlyModeEnabled) return

  if (buttons.KeyQ?.down) onKeyQ()
  if (buttons.KeyE?.down) onKeyE()
  if (buttons.KeyF?.down) onKeyF()
  if (buttons.KeyT?.down) onKeyT()
  if (buttons.KeyR?.down) onKeyR()
  if (buttons.KeyY?.down) onKeyY()
  if (buttons.KeyC?.down) onKeyC()
  if (buttons.KeyX?.down) onKeyX()
  if (buttons.KeyZ?.down) onKeyZ(!!buttons.ControlLeft?.pressed, !!buttons.ShiftLeft?.pressed)
  if (buttons.Equal?.down) onEqual()
  if (buttons.Minus?.down) onMinus()
  if (buttons.Delete?.down) onDelete()

  if (selectionState.selectedEntities) {
    const lastSelection = selectionState.selectedEntities[selectionState.selectedEntities.length - 1]
    if (hasComponent(lastSelection.value as Entity, TransformGizmoComponent))
      dragging = getComponent(lastSelection.value as Entity, TransformGizmoComponent).dragging
  }
  const selecting = buttons.PrimaryClick?.pressed && !dragging
  const zoom = pointerState.scroll.y
  const panning = buttons.AuxiliaryClick?.pressed

  if (selecting) {
    const editorCameraState = getMutableState(EditorCameraState)
    editorCameraState.isOrbiting.set(true)
    const mouseMovement = pointerState.movement
    if (mouseMovement) {
      editorCameraState.cursorDeltaX.set(mouseMovement.x)
      editorCameraState.cursorDeltaY.set(mouseMovement.y)
    }
  } else if (panning) {
    const editorCameraState = getMutableState(EditorCameraState)
    editorCameraState.isPanning.set(true)
    const mouseMovement = pointerState.movement
    if (mouseMovement) {
      editorCameraState.cursorDeltaX.set(mouseMovement.x)
      editorCameraState.cursorDeltaY.set(mouseMovement.y)
    }
  } else if (zoom) {
    throttleZoom(zoom)
  }
}

const SceneObjectEntityReactor = (props: { entity: Entity }) => {
  useEffect(() => {
    setComponent(props.entity, InputComponent)
    return () => {
      removeComponent(props.entity, InputComponent)
    }
  }, [])

  return null
}

const reactor = () => {
  const sceneObjectEntities = useQuery([SceneObjectComponent])
  const selectionState = useHookstate(getMutableState(SelectionState))
  const sceneState = useHookstate(getMutableState(SceneState))
  const sceneQuery = defineQuery([SceneObjectComponent])
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
    const selectedEntities = selectionState.selectedEntities
    if (!selectedEntities.value) return

    for (const entity of sceneQuery()) {
      if (!hasComponent(entity, TransformGizmoComponent)) continue
      removeComponent(entity as Entity, TransformGizmoComponent)
    }
    const lastSelection = selectedEntities[selectedEntities.length - 1].value
    if (!lastSelection) return

    if (typeof lastSelection === 'string') return // TODO : gizmo for 3d objects without Ids

    setComponent(lastSelection as Entity, TransformGizmoComponent)

    // handle gizmo attachment
  }, [selectionState.selectedParentEntities])

  // there is no deterministic ordering for react useeffect better to club them togther

  return (
    <>
      {sceneObjectEntities.map((entity) => (
        <SceneObjectEntityReactor key={entity} entity={entity} />
      ))}
    </>
  )
}

export const EditorControlSystem = defineSystem({
  uuid: 'ee.editor.EditorControlSystem',
  execute,
  reactor,
  subSystems: [EditorSelectionReceptorSystem, SceneSnapshotSystem]
})
