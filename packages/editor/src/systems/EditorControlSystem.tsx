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

import { PresentationSystemGroup, UndefinedEntity, UUIDComponent } from '@etherealengine/ecs'
import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { GLTFSnapshotAction } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { GLTFSnapshotState } from '@etherealengine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { TransformMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { dispatchAction, getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { FlyControlComponent } from '@etherealengine/spatial/src/camera/components/FlyControlComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { InfiniteGridComponent } from '@etherealengine/spatial/src/renderer/components/InfiniteGridHelper'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import {
  EntityTreeComponent,
  getAncestorWithComponent
} from '@etherealengine/spatial/src/transform/components/EntityTree'

import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { TransformGizmoControlComponent } from '../classes/TransformGizmoControlComponent'
import { TransformGizmoControlledComponent } from '../classes/TransformGizmoControlledComponent'
import { addMediaNode } from '../functions/addMediaNode'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import isInputSelected from '../functions/isInputSelected'
import {
  setTransformMode,
  toggleSnapMode,
  toggleTransformPivot,
  toggleTransformSpace
} from '../functions/transformFunctions'
import { EditorErrorState } from '../services/EditorErrorServices'
import { EditorHelperState } from '../services/EditorHelperState'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import { ObjectGridSnapState } from './ObjectGridSnapSystem'

const raycaster = new Raycaster()
const raycasterResults: Intersection<Object3D>[] = []

const gizmoControlledQuery = defineQuery([TransformGizmoControlledComponent])
let primaryClickAccum = 0

const onKeyB = () => {
  getMutableState(ObjectGridSnapState).enabled.set(!getState(ObjectGridSnapState).enabled)
}

const onKeyF = () => {
  getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent).focusedEntities.set(
    SelectionState.getSelectedEntities()
  )
}

// const onKeyQ = () => {
//   const nodes = SelectionState.getSelectedEntities()
//   const gizmo = gizmoControlledQuery()
//   if (gizmo.length === 0) return
//   const gizmoEntity = gizmo[gizmo.length - 1]
//   const gizmoTransform = getComponent(gizmoEntity, TransformComponent)
//   const editorHelperState = getState(EditorHelperState)
//   EditorControlFunctions.rotateAround(
//     nodes,
//     Vector3_Up,
//     editorHelperState.rotationSnap * MathUtils.DEG2RAD,
//     gizmoTransform.position
//   )
// }

// const onKeyE = () => {
//   const nodes = SelectionState.getSelectedEntities()
//   const gizmo = gizmoControlledQuery()
//   if (gizmo.length === 0) return
//   const gizmoEntity = gizmo[gizmo.length - 1]
//   const gizmoTransform = getComponent(gizmoEntity, TransformComponent)
//   const editorHelperState = getState(EditorHelperState)
//   EditorControlFunctions.rotateAround(
//     nodes,
//     Vector3_Up,
//     -editorHelperState.rotationSnap * MathUtils.DEG2RAD,
//     gizmoTransform.position
//   )
// }

const onEscape = () => {
  EditorControlFunctions.replaceSelection([])
}

const onKeyW = () => {
  setTransformMode(TransformMode.translate)
}

const onKeyE = () => {
  setTransformMode(TransformMode.rotate)
}

const onKeyR = () => {
  setTransformMode(TransformMode.scale)
}

const onKeyC = () => {
  toggleSnapMode()
}

const onKeyX = () => {
  toggleTransformPivot()
}

const onKeyZ = (control: boolean, shift: boolean) => {
  const source = getState(EditorState).scenePath
  if (!source) return
  if (control) {
    const state = getState(GLTFSnapshotState)[source]
    if (shift) {
      if (state.index >= state.snapshots.length - 1) return
      dispatchAction(GLTFSnapshotAction.redo({ count: 1, source }))
    } else {
      if (state.index <= 0) return
      dispatchAction(GLTFSnapshotAction.undo({ count: 1, source }))
    }
  } else {
    toggleTransformSpace()
  }
}

const onEqual = () => {
  const rendererState = useMutableState(RendererState)
  rendererState.gridHeight.set(rendererState.gridHeight.value + 1)
}

const onMinus = () => {
  const rendererState = useMutableState(RendererState)
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
  const entity = AvatarComponent.getSelfAvatarEntity()
  if (entity) return

  if (hasComponent(Engine.instance.cameraEntity, FlyControlComponent)) return

  const deltaSeconds = getState(ECSState).deltaSeconds

  const selectedEntities = SelectionState.getSelectedEntities()

  const inputSources = inputQuery()

  const buttons = InputComponent.getMergedButtonsForInputSources(inputSources)

  if (buttons.KeyB?.down) onKeyB()

  if (buttons.KeyE?.down) onKeyE()
  if (buttons.KeyR?.down) onKeyR()
  if (buttons.KeyW?.down) onKeyW()
  if (buttons.KeyC?.down) onKeyC()
  if (buttons.KeyX?.down) onKeyX()
  if (buttons.KeyF?.down) onKeyF()
  if (buttons.KeyZ?.down) onKeyZ(!!buttons.ControlLeft?.pressed, !!buttons.ShiftLeft?.pressed)
  if (buttons.Equal?.down) onEqual()
  if (buttons.Minus?.down) onMinus()
  if (buttons.Escape?.down) onEscape()
  if (buttons.Delete?.down) onDelete()

  if (selectedEntities) {
    const lastSelection = selectedEntities[selectedEntities.length - 1]
    if (hasComponent(lastSelection, TransformGizmoControlledComponent)) {
      // dont let use the editor camera while dragging
      const mainOrbitCamera = getOptionalMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
      const controllerEntity = getComponent(lastSelection, TransformGizmoControlledComponent).controller
      if (mainOrbitCamera && controllerEntity !== UndefinedEntity)
        mainOrbitCamera.disabled.set(getComponent(controllerEntity, TransformGizmoControlComponent).dragging)
    }
  }

  if (buttons.PrimaryClick?.pressed) {
    primaryClickAccum += deltaSeconds
  }
  if (primaryClickAccum <= 0.2) {
    if (buttons.PrimaryClick?.up) {
      let clickedEntity = InputSourceComponent.getClosestIntersectedEntity(inputSources[0])
      while (
        !hasComponent(clickedEntity, SourceComponent) &&
        getOptionalComponent(clickedEntity, EntityTreeComponent)?.parentEntity
      ) {
        clickedEntity = getComponent(clickedEntity, EntityTreeComponent).parentEntity!
      }
      if (hasComponent(clickedEntity, SourceComponent)) {
        const modelComponent = getAncestorWithComponent(clickedEntity, ModelComponent)
        const ancestorModelEntity = modelComponent || clickedEntity
        SelectionState.updateSelection([
          getComponent(
            SelectionState.getSelectedEntities()[0] === ancestorModelEntity ? clickedEntity : ancestorModelEntity,
            UUIDComponent
          )
        ])
      }
    }
  }
  if (buttons.PrimaryClick?.up) {
    primaryClickAccum = 0
  }
}

const reactor = () => {
  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)

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
    // set the active orbit camera to the main camera
    setComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
    setComponent(Engine.instance.cameraEntity, InputComponent)
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
