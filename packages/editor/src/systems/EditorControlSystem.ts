/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Intersection, Layers, Object3D, Raycaster } from 'three'

import {
  Entity,
  EntityTreeComponent,
  getAncestorWithComponents,
  PresentationSystemGroup,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { TransformMode } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { FlyControlComponent } from '@ir-engine/spatial/src/camera/components/FlyControlComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { InfiniteGridComponent } from '@ir-engine/spatial/src/renderer/components/InfiniteGridHelper'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'

import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
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

import { EditorHelperState, PlacementMode } from '../services/EditorHelperState'

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { usesCtrlKey } from '@ir-engine/common/src/utils/OperatingSystemFunctions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { InputButtonBindings } from '@ir-engine/spatial/src/input/components/InputComponent'
import { KeyboardButton } from '@ir-engine/spatial/src/input/state/ButtonState'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { TransformGizmoControlledComponent } from '../classes/gizmo/transform/TransformGizmoControlledComponent'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import { ClickPlacementState } from './ClickPlacementSystem'
import { ObjectGridSnapState } from './ObjectGridSnapSystem'

export const EditorButtonAlias = {
  Undo: [[KeyboardButton.ControlLeft, KeyboardButton.KeyZ]],
  Redo: [[KeyboardButton.ControlLeft, KeyboardButton.ShiftLeft, KeyboardButton.KeyZ]],
  ObjectGridSnap: [KeyboardButton.KeyB],
  TransformModeTranslate: [KeyboardButton.KeyW],
  TransformModeRotate: [KeyboardButton.KeyE],
  TransformModeScale: [KeyboardButton.KeyR],
  TogglePlacementMode: [KeyboardButton.KeyP],
  ToggleSnapMode: [KeyboardButton.KeyC],
  ToggleTransformPivot: [KeyboardButton.KeyX],
  ToggleTransformSpace: [KeyboardButton.KeyZ],
  CameraFocus: [KeyboardButton.KeyF],
  IncreaseGridHeight: [KeyboardButton.Equal],
  DecreaseGridHeight: [KeyboardButton.Minus],
  CancelSelection: [KeyboardButton.Escape],
  DeleteSelection: [KeyboardButton.Delete]
} satisfies InputButtonBindings

const raycaster = new Raycaster()
const raycasterResults: Intersection<Object3D>[] = []

const onObjectGridSnap = () => {
  getMutableState(ObjectGridSnapState).enabled.set(!getState(ObjectGridSnapState).enabled)
}

const onCameraFocus = () => {
  getMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent).focusedEntities.set(
    SelectionState.getSelectedEntities()
  )
}

const onCancelSelection = () => {
  EditorControlFunctions.replaceSelection([])
  const element = document.activeElement
  if (element instanceof HTMLElement) {
    element.blur()
  }
}

const onTransformModeTranslate = () => {
  setTransformMode(TransformMode.translate)
}

const onTogglePlacementMode = () => {
  const editorHelperState = getMutableState(EditorHelperState)
  if (editorHelperState.placementMode.value === PlacementMode.CLICK) {
    editorHelperState.placementMode.set(PlacementMode.DRAG)
  } else {
    editorHelperState.placementMode.set(PlacementMode.CLICK)
  }
}

const onTransformModeRotate = () => {
  setTransformMode(TransformMode.rotate)
}

const onTransformModeScale = () => {
  setTransformMode(TransformMode.scale)
}

const onToggleSnapMode = () => {
  toggleSnapMode()
}

const onToggleTransformPivot = () => {
  toggleTransformPivot()
}

// Add new onToggleTransformSpace callback to toggle transform space
const onToggleTransformSpace = () => {
  toggleTransformSpace()
}

// New callbacks for undo/redo
const onUndo = () => {
  const rootEntity = getState(EditorState).rootEntity
  if (!rootEntity) return
  // undo logic placeholder
}

const onRedo = () => {
  const rootEntity = getState(EditorState).rootEntity
  if (!rootEntity) return
  // redo logic placeholder
}

const onIncreaseGridHeight = () => {
  const rendererState = useMutableState(RendererState)
  rendererState.gridHeight.set(rendererState.gridHeight.value + 1)
}

const onDecreaseGridHeight = () => {
  const rendererState = useMutableState(RendererState)
  rendererState.gridHeight.set(rendererState.gridHeight.value - 1)
}

const onDeleteSelection = () => {
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

const findNextSelectionEntity = (topLevelParent: Entity, child: Entity): Entity => {
  // Check for adjacent child
  const childTree = getComponent(child, EntityTreeComponent)
  const parentTree = getComponent(childTree.parentEntity, EntityTreeComponent)
  if (topLevelParent !== child) {
    const children = parentTree.children
    const currentChildIndex = children.findIndex((entity) => child === entity)
    if (children.length > currentChildIndex + 1) return children[currentChildIndex + 1]
  }

  // Otherwise if child has children traverse down
  if (childTree.children.length) return childTree.children[0]

  if (childTree.parentEntity === topLevelParent || parentTree.parentEntity === topLevelParent) return topLevelParent
  return findNextSelectionEntity(topLevelParent, parentTree.parentEntity)
}

const inputQuery = defineQuery([InputSourceComponent])
let clickStartEntity = UndefinedEntity

let hierarchyFeatureFlagEnabled = false

const execute = () => {
  const entity = AvatarComponent.getSelfAvatarEntity()
  if (entity) return

  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  const buttons = InputComponent.getMergedButtons(viewerEntity, EditorButtonAlias)
  const selectedEntities = SelectionState.getSelectedEntities()

  if (hasComponent(viewerEntity, FlyControlComponent)) return

  const inputSources = inputQuery()

  if (buttons.ObjectGridSnap?.down) onObjectGridSnap()
  if (buttons.TransformModeRotate?.down) onTransformModeRotate()
  if (buttons.TogglePlacementMode?.down) onTogglePlacementMode()
  if (buttons.TransformModeScale?.down) onTransformModeScale()
  if (buttons.TransformModeTranslate?.down) onTransformModeTranslate()
  if (buttons.ToggleSnapMode?.down) onToggleSnapMode()
  if (buttons.ToggleTransformPivot?.down) onToggleTransformPivot()
  if (buttons.ToggleTransformSpace?.down) onToggleTransformSpace()
  if (buttons.CameraFocus?.down) onCameraFocus()
  if (buttons.Undo?.down) onUndo()
  if (buttons.Redo?.down) onRedo()
  if (buttons.IncreaseGridHeight?.down) onIncreaseGridHeight()
  if (buttons.DecreaseGridHeight?.down) onDecreaseGridHeight()
  if (buttons.CancelSelection?.down) onCancelSelection()
  if (buttons.DeleteSelection?.down) onDeleteSelection()

  if (selectedEntities) {
    const lastSelection = selectedEntities[selectedEntities.length - 1]
    if (hasComponent(lastSelection, TransformGizmoControlledComponent)) {
      // dont let use the editor camera while dragging
      const mainOrbitCamera = getOptionalMutableComponent(Engine.instance.cameraEntity, CameraOrbitComponent)
      const controllerEntity = getComponent(lastSelection, TransformGizmoControlledComponent).controller
      if (
        mainOrbitCamera &&
        controllerEntity !== UndefinedEntity &&
        hasComponent(controllerEntity, TransformGizmoControlComponent)
      ) {
        mainOrbitCamera.disabled.set(getComponent(controllerEntity, TransformGizmoControlComponent).dragging)
      }
    }
  }

  if (buttons.PrimaryClick?.pressed) {
    let closestIntersection = {
      entity: UndefinedEntity,
      distance: Infinity
    }
    if (buttons.PrimaryClick?.down) {
      for (const inputSourceEntity of inputSources) {
        const intersection = InputSourceComponent.getClosestIntersection(inputSourceEntity)
        if (intersection && intersection.distance < closestIntersection.distance) {
          closestIntersection = intersection
        }
      }

      // Get top most parent entity from the GLTF document
      let selectedParentEntity = getAncestorWithComponents(closestIntersection.entity, [GLTFComponent])
      // If selectedParentEntity has a parent in a different GLTF document use that as top most parent
      const parent = getOptionalComponent(selectedParentEntity, EntityTreeComponent)?.parentEntity
      if (parent && GLTFComponent.getInstanceID(parent) !== getComponent(selectedParentEntity, SourceComponent)) {
        selectedParentEntity = parent
      }

      // If entity is already selected set closest intersection, otherwise set top parent
      const selectedEntity =
        selectedParentEntity === clickStartEntity ? closestIntersection.entity : selectedParentEntity

      // If not showing model children in hierarchy don't allow those objects to be selected
      if (!hierarchyFeatureFlagEnabled) {
        const inCurrentScene = hasComponent(selectedParentEntity, SceneComponent)
        clickStartEntity = inCurrentScene ? selectedEntity : clickStartEntity
      } else {
        clickStartEntity = selectedEntity
      }

      /** @todo decide how we want selection to work with heirarchies */
      // Walks object heirarchy everytime a selected object is clicked again
      // const prevParentEntity = findTopLevelParent(clickStartEntity)
      // if (selectedParentEntity === prevParentEntity) {
      //   clickStartEntity = findNextSelectionEntity(prevParentEntity, clickStartEntity)
      // } else {
      //   clickStartEntity = selectedParentEntity
      // }
    }
    const capturingEntity = getState(InputState).capturingEntity
    if (capturingEntity !== UndefinedEntity && capturingEntity !== clickStartEntity) {
      clickStartEntity = capturingEntity
    }
  }

  if (buttons.PrimaryClick?.up && !buttons.PrimaryClick?.dragging) {
    if (
      hasComponent(clickStartEntity, SourceComponent) &&
      !getState(ClickPlacementState).placementEntity &&
      getMutableState(EditorHelperState).gizmoEnabled.value
    ) {
      const selectedEntities = SelectionState.getSelectedEntities()

      //only update selection if the selection actually changed (prevents unnecessarily creating new transform gizmos in edit mode)
      if (
        selectedEntities.length !== 1 ||
        (selectedEntities.length === 1 && selectedEntities[0] !== clickStartEntity)
      ) {
        const ctrlOrMetaClicked = usesCtrlKey()
          ? !!buttons.ControlLeft?.pressed || !!buttons.ControlRight?.pressed
          : !!buttons.MetaLeft?.pressed || !!buttons.MetaRight?.pressed

        updateSelection(
          clickStartEntity,
          ctrlOrMetaClicked,
          !!buttons.ShiftLeft?.pressed || !!buttons.ShiftRight?.pressed
        )
      }
    }
  }
}

const updateSelection = (clickedEntity: Entity, control: boolean, shift: boolean) => {
  const selectedEntities = SelectionState.getSelectedEntities()
  if (control) {
    if (selectedEntities.includes(clickedEntity)) {
      SelectionState.updateSelection(
        selectedEntities
          .filter((entity) => entity !== clickedEntity)
          .map((entity) => getComponent(entity, UUIDComponent))
      )
    } else {
      SelectionState.updateSelection([
        ...selectedEntities.map((entity) => getComponent(entity, UUIDComponent)),
        getComponent(clickedEntity, UUIDComponent)
      ])
    }
  }
  /** @todo decide how we want shift selection to work with viewport */
  // else if (shift) {
  //   const lastSelectedEntity = selectedEntities[selectedEntities.length - 1]
  //   const lastSelectedIndex = selectedEntities.indexOf(lastSelectedEntity)
  //   const clickedEntityIndex = selectedEntities.indexOf(clickedEntity)
  //   if (lastSelectedIndex === -1) {
  //     SelectionState.updateSelection([getComponent(clickedEntity, UUIDComponent)])
  //   } else if (clickedEntityIndex === -1) {
  //     const min = Math.min(lastSelectedIndex, selectedEntities.indexOf(clickedEntity))
  //     const max = Math.max(lastSelectedIndex, selectedEntities.indexOf(clickedEntity))
  //     const newSelection = selectedEntities.slice(0, min).concat(selectedEntities.slice(max))
  //
  //     SelectionState.updateSelection(newSelection.map((entity) => getComponent(entity, UUIDComponent)))
  //   } else {
  //     const min = Math.min(lastSelectedIndex, clickedEntityIndex)
  //     const max = Math.max(lastSelectedIndex, clickedEntityIndex)
  //     const newSelection = selectedEntities.slice(min, max + 1)
  //     SelectionState.updateSelection(newSelection.map((entity) => getComponent(entity, UUIDComponent)))
  //   }
  // }
  else {
    SelectionState.updateSelection([getComponent(clickedEntity, UUIDComponent)])
  }
}

const reactor = () => {
  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)
  const flag = useFeatureFlags([FeatureFlags.Studio.UI.Hierarchy.ShowModelChildren])

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
    const infiniteGridHelperEntity = rendererState.infiniteGridHelperEntity.value
    if (!infiniteGridHelperEntity) return
    setComponent(infiniteGridHelperEntity, InfiniteGridComponent, { size: editorHelperState.translationSnap.value })
  }, [editorHelperState.translationSnap, rendererState.infiniteGridHelperEntity])

  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

  useEffect(() => {
    if (!viewerEntity) return

    // set the active orbit camera to the main camera
    setComponent(viewerEntity, CameraOrbitComponent)
    setComponent(viewerEntity, InputComponent)

    return () => {
      removeComponent(viewerEntity, CameraOrbitComponent)
      removeComponent(viewerEntity, InputComponent)
    }
  }, [viewerEntity])

  useEffect(() => {
    hierarchyFeatureFlagEnabled = flag[0]
  }, [flag])

  return null
}

export const EditorControlSystem = defineSystem({
  uuid: 'ee.editor.EditorControlSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
