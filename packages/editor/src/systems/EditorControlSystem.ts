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
import { Intersection, Layers, MathUtils, Object3D, Quaternion, Raycaster, Vector3 } from 'three'

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
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { dispatchAction, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { FlyControlComponent } from '@ir-engine/spatial/src/camera/components/FlyControlComponent'
import { TransformMode } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { InfiniteGridComponent } from '@ir-engine/spatial/src/renderer/components/InfiniteGridHelper'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'

import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
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

import { usesCtrlKey } from '@ir-engine/common/src/utils/OperatingSystemFunctions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { InputButtonBindings } from '@ir-engine/spatial/src/input/components/InputComponent'
import { KeyboardButton, MouseButton } from '@ir-engine/spatial/src/input/state/ButtonState'
import { isEntityGlb } from '../functions/utils.ts'
import { EditorHistoryActions, EditorHistoryFunctions, EditorHistoryState } from '../services/EditorHistoryState'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import { ClickPlacementState } from './ClickPlacementSystem'
import { ObjectGridSnapState } from './ObjectGridSnapSystem'

export const EditorButtonBindings = {
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
  IncreaseGridHeight: [KeyboardButton.Equal],
  DecreaseGridHeight: [KeyboardButton.Minus],
  CancelSelection: [KeyboardButton.Escape],
  DeleteSelection: [KeyboardButton.Delete],
  FlyControlMode: [MouseButton.SecondaryClick]
} satisfies InputButtonBindings

const raycaster = new Raycaster()
const raycasterResults: Intersection<Object3D>[] = []

const onObjectGridSnap = () => {
  getMutableState(ObjectGridSnapState).enabled.set(!getState(ObjectGridSnapState).enabled)
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

const onToggleTransformSpace = () => {
  toggleTransformSpace()
}

const onUndo = () => {
  const rootEntity = getState(EditorState).rootEntity
  if (!rootEntity) return
  const sourceID = GLTFComponent.getInstanceID(rootEntity)
  if (EditorHistoryState.canRedo(sourceID)) dispatchAction(EditorHistoryActions.undo({ sourceID }))
}

const onRedo = () => {
  const rootEntity = getState(EditorState).rootEntity
  if (!rootEntity) return
  const sourceID = GLTFComponent.getInstanceID(rootEntity)
  if (EditorHistoryState.canRedo(sourceID)) dispatchAction(EditorHistoryActions.redo({ sourceID }))
}

const onIncreaseGridHeight = () => {
  const rendererState = getMutableState(RendererState)
  rendererState.gridHeight.set(rendererState.gridHeight.value + 1)
}

const onDecreaseGridHeight = () => {
  const rendererState = getMutableState(RendererState)
  rendererState.gridHeight.set(rendererState.gridHeight.value - 1)
}

const onDeleteSelection = () => {
  EditorControlFunctions.removeObject(SelectionState.getSelectedEntities())
  EditorHistoryFunctions.snapshot()
}

let lastDistanceToCenter = 10

const onFlyControlModeBegin = () => {
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  if (!viewerEntity) return
  const cameraOrbit = getOptionalComponent(viewerEntity, CameraOrbitComponent)
  if (cameraOrbit) {
    const position = TransformComponent.getWorldPosition(viewerEntity, new Vector3())
    lastDistanceToCenter = cameraOrbit.cameraOrbitCenter.distanceTo(position)
  }
  removeComponent(viewerEntity, CameraOrbitComponent)
  setComponent(viewerEntity, FlyControlComponent, {
    boostSpeed: 4,
    moveSpeed: 4,
    lookSensitivity: 5,
    maxXRotation: MathUtils.degToRad(80)
  })
}

const directionToCenter = new Vector3()
const onFlyControlModeEnd = () => {
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  removeComponent(viewerEntity, FlyControlComponent)
  setComponent(viewerEntity, CameraOrbitComponent)
  const position = TransformComponent.getWorldPosition(viewerEntity, new Vector3())
  const rotation = TransformComponent.getWorldRotation(viewerEntity, new Quaternion())
  const editorCameraCenter = getComponent(viewerEntity, CameraOrbitComponent).cameraOrbitCenter
  editorCameraCenter.copy(position).add(directionToCenter.set(0, 0, -lastDistanceToCenter).applyQuaternion(rotation))
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

let clickStartEntity = UndefinedEntity
let hierarchyFeatureFlagEnabled = false

const execute = () => {
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  const buttons = InputComponent.getButtons(viewerEntity, EditorButtonBindings)

  if (buttons.FlyControlMode?.down) onFlyControlModeBegin()
  if (buttons.FlyControlMode?.up) onFlyControlModeEnd()

  if (hasComponent(viewerEntity, FlyControlComponent)) return

  const entity = AvatarComponent.getSelfAvatarEntity()
  if (entity) return

  if (buttons.Undo?.down) onUndo()
  if (buttons.Redo?.down) onRedo()
  if (buttons.ObjectGridSnap?.down) onObjectGridSnap()
  if (buttons.TransformModeRotate?.down) onTransformModeRotate()
  if (buttons.TogglePlacementMode?.down) onTogglePlacementMode()
  if (buttons.TransformModeScale?.down) onTransformModeScale()
  if (buttons.TransformModeTranslate?.down) onTransformModeTranslate()
  if (buttons.ToggleSnapMode?.down) onToggleSnapMode()
  if (buttons.ToggleTransformPivot?.down) onToggleTransformPivot()
  if (buttons.ToggleTransformSpace?.down) onToggleTransformSpace()
  if (buttons.IncreaseGridHeight?.down) onIncreaseGridHeight()
  if (buttons.DecreaseGridHeight?.down) onDecreaseGridHeight()
  if (buttons.CancelSelection?.down) onCancelSelection()
  if (buttons.DeleteSelection?.down) onDeleteSelection()

  if (buttons.PrimaryClick?.pressed) {
    let closestIntersection = {
      entity: UndefinedEntity,
      distance: Infinity
    }
    if (buttons.PrimaryClick?.down) {
      const intersection = InputSourceComponent.getClosestIntersection(buttons.PrimaryClick.inputSourceEntity)
      if (intersection && intersection.distance < closestIntersection.distance) {
        closestIntersection = intersection
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

      // If hiding children of GLB, don't allow those children to be selected (clicking in scene view)
      if (hierarchyFeatureFlagEnabled && selectedParentEntity) {
        const forceSelectGlbParent = isEntityGlb(selectedParentEntity) // && hasComponent(selectedParentEntity, SceneComponent)
        clickStartEntity = forceSelectGlbParent ? selectedParentEntity : selectedEntity //selectedEntity vs clickStartEntity so that we allow closest intersection drill down above to work
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

  //@todo remove hardcoded value once feature flag is added to MT
  const hideGlbChildrenFeatureFlag = [true] // useFeatureFlags([FeatureFlags.Studio.UI.Hierarchy.HideGlbChildren])

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

  const selectedEntities = SelectionState.useSelectedEntities()
  useEffect(() => {
    const cameraOrbit = getOptionalMutableComponent(viewerEntity, CameraOrbitComponent)
    cameraOrbit?.focusedEntities.set(selectedEntities)
  }, [selectedEntities])

  const rootEntity = useMutableState(EditorState).rootEntity.value
  const sceneLoaded = GLTFComponent.useSceneLoaded(rootEntity)

  /** On scene load ensure the camera isn't stuck at the origin */
  useEffect(() => {
    if (!sceneLoaded) return
    const cameraOrbit = getOptionalMutableComponent(viewerEntity, CameraOrbitComponent)
    cameraOrbit?.focusedEntities.set([rootEntity])
  }, [sceneLoaded])

  useEffect(() => {
    hierarchyFeatureFlagEnabled = hideGlbChildrenFeatureFlag[0]
  }, [hideGlbChildrenFeatureFlag])

  return null
}

export const EditorControlSystem = defineSystem({
  uuid: 'ee.editor.EditorControlSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
