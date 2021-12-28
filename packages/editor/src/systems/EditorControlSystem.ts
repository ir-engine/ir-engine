import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import {
  SnapMode,
  SnapModeType,
  TransformAxis,
  TransformAxisConstraints,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType
} from '@xrengine/engine/src/scene/constants/transformConstants'
import {
  Vector3,
  Quaternion,
  Raycaster,
  MathUtils,
  Layers,
  Object3D,
  Vector2,
  Intersection,
  Box3,
  Plane,
  Ray
} from 'three'
import { EditorCameraComponent, EditorCameraComponentType } from '../classes/EditorCameraComponent'
import { EditorControlComponent, EditorControlComponentType } from '../classes/EditorControlComponent'
import { FlyControlComponent, FlyControlComponentType } from '../classes/FlyControlComponent'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { EditorActionSet, FlyActionSet } from '../controls/input-mappings'
import { getIntersectingNodeOnScreen } from '../functions/getIntersectingNode'
import { getInput } from '../functions/parseInputActionMapping'
import { CommandManager } from '../managers/CommandManager'
import { SceneManager } from '../managers/SceneManager'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'

const SELECT_SENSITIVITY = 0.001

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function EditorControlSystem(_: World): Promise<System> {
  const editorControlQuery = defineQuery([EditorControlComponent])

  const raycaster = new Raycaster()
  const raycasterResults: Intersection<Object3D>[] = []
  const raycastIgnoreLayers = new Layers()
  const box = new Box3()
  const inverseGizmoQuaternion = new Quaternion()
  const planeNormal = new Vector3()
  const planeIntersection = new Vector3()
  const transformPlane = new Plane()
  const centerViewportPosition = new Vector2()
  const ray = new Ray()
  const dragOffset = new Vector3()
  const dragVector = new Vector3()
  const initDragVector = new Vector3()
  const deltaDragVector = new Vector3()
  const translationVector = new Vector3()
  const constraintVector = new Vector3()
  const prevPos = new Vector3()
  const prevScale = new Vector3()
  const curScale = new Vector3()
  const scaleVector = new Vector3()
  const initRotationDrag = new Vector3()
  const normalizedInitRotationDrag = new Vector3()
  const normalizedCurRotationDrag = new Vector3()
  const curRotationDrag = new Vector3()
  const viewDirection = new Vector3()
  let prevRotationAngle = 0

  let editorControlComponent: EditorControlComponentType
  let flyControlComponent: FlyControlComponentType
  let cameraComponent: EditorCameraComponentType
  let selectedTransformRoots: EntityTreeNode[]
  let gizmoObj: TransformGizmo

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

  const getRaycastPosition = (coords: Vector2, target: Vector3, snapAmount: number = 0): void => {
    raycaster.setFromCamera(coords, Engine.camera)
    raycasterResults.length = 0
    raycastIgnoreLayers.set(1)
    const os = CommandManager.instance.selectedTransformRoots.map(
      (o) => getComponent(o.entity, Object3DComponent).value
    )

    findIntersectObjects(Engine.scene, os, raycastIgnoreLayers)
    findIntersectObjects(SceneManager.instance.grid)

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

  return () => {
    for (let entity of editorControlQuery()) {
      editorControlComponent = getComponent(entity, EditorControlComponent)
      if (!editorControlComponent.enable) return

      selectedTransformRoots = CommandManager.instance.selectedTransformRoots
      flyControlComponent = getComponent(entity, FlyControlComponent)
      gizmoObj = getComponent(SceneManager.instance.gizmoEntity, Object3DComponent)?.value as TransformGizmo

      if (!gizmoObj) return

      if (selectedTransformRoots.length === 0 || editorControlComponent.transformMode === TransformMode.Disabled) {
        gizmoObj.visible = false
      } else {
        const lastSelectedObject = CommandManager.instance.selected[CommandManager.instance.selected.length - 1]
        const lastSelectedObj3d = getComponent(lastSelectedObject.entity, Object3DComponent).value
        const isChanged =
          editorControlComponent.selectionChanged ||
          editorControlComponent.transformModeChanged ||
          editorControlComponent.transformPropertyChanged

        if (isChanged || editorControlComponent.transformPivotChanged) {
          if (editorControlComponent.transformPivot === TransformPivot.Selection) {
            lastSelectedObj3d.getWorldPosition(gizmoObj.position)
          } else {
            box.makeEmpty()

            for (let i = 0; i < selectedTransformRoots.length; i++) {
              box.expandByObject(getComponent(selectedTransformRoots[i].entity, Object3DComponent).value)
            }

            box.getCenter(gizmoObj.position)
            if (editorControlComponent.transformPivot === TransformPivot.Bottom) {
              gizmoObj.position.y = box.min.y
            }
          }
        }

        if (isChanged || editorControlComponent.transformSpaceChanged) {
          if (editorControlComponent.transformSpace === TransformSpace.LocalSelection) {
            lastSelectedObj3d.getWorldQuaternion(gizmoObj.quaternion)
          } else {
            gizmoObj.rotation.set(0, 0, 0)
          }

          inverseGizmoQuaternion.copy(gizmoObj.quaternion).invert()
        }

        if (
          (editorControlComponent.transformModeChanged || editorControlComponent.transformSpaceChanged) &&
          editorControlComponent.transformMode === TransformMode.Scale
        ) {
          gizmoObj.setLocalScaleHandlesVisible(editorControlComponent.transformSpace !== TransformSpace.World)
        }

        gizmoObj.visible = true
      }

      const cursorPosition = getInput(EditorActionSet.cursorPosition)
      const isGrabbing =
        editorControlComponent.transformMode === TransformMode.Grab ||
        editorControlComponent.transformMode === TransformMode.Placement
      const selectStartAndNoGrabbing =
        getInput(EditorActionSet.selectStart) && !isGrabbing && !flyControlComponent.enable

      if (selectStartAndNoGrabbing) {
        editorControlComponent.selectStartPosition.copy(getInput(EditorActionSet.selectStartPosition))

        if (gizmoObj.activeControls) {
          raycaster.setFromCamera(editorControlComponent.selectStartPosition, Engine.camera)
          gizmoObj.selectAxisWithRaycaster(raycaster)

          if (gizmoObj.selectedAxis) {
            planeNormal.copy(gizmoObj.selectedPlaneNormal!).applyQuaternion(gizmoObj.quaternion).normalize()
            transformPlane.setFromNormalAndCoplanarPoint(planeNormal, gizmoObj.position)
            editorControlComponent.dragging = true
          } else {
            editorControlComponent.dragging = false
          }
        }
      } else if (gizmoObj.activeControls && !editorControlComponent.dragging) {
        raycaster.setFromCamera(cursorPosition, Engine.camera)
        gizmoObj.highlightHoveredAxis(raycaster)
      }

      const modifier = getInput(EditorActionSet.modifier)
      const shouldSnap = (editorControlComponent.snapMode === SnapMode.Grid) === !modifier
      const selectEnd = getInput(EditorActionSet.selectEnd)

      if (editorControlComponent.dragging || isGrabbing) {
        let constraint
        if (isGrabbing) {
          getRaycastPosition(
            flyControlComponent.enable ? centerViewportPosition : cursorPosition,
            planeIntersection,
            shouldSnap ? editorControlComponent.translationSnap : 0
          )
          constraint = TransformAxisConstraints.XYZ
        } else {
          ray.origin.setFromMatrixPosition(Engine.camera.matrixWorld)
          ray.direction.set(cursorPosition.x, cursorPosition.y, 0).unproject(Engine.camera).sub(ray.origin)
          ray.intersectPlane(transformPlane, planeIntersection)
          constraint = TransformAxisConstraints[gizmoObj.selectedAxis!]
        }

        if (!constraint) {
          console.warn(
            `Axis Constraint is undefined.
            transformAxis was ${gizmoObj.selectedAxis}.
            transformMode was ${editorControlComponent.transformMode}.
            dragging was ${editorControlComponent.dragging}.`
          )
        }

        if (selectStartAndNoGrabbing) dragOffset.subVectors(gizmoObj.position, planeIntersection)
        else if (isGrabbing) dragOffset.set(0, 0, 0)

        planeIntersection.add(dragOffset)

        if (
          editorControlComponent.transformMode === TransformMode.Translate ||
          editorControlComponent.transformMode === TransformMode.Grab ||
          editorControlComponent.transformMode === TransformMode.Placement
        ) {
          translationVector
            .subVectors(planeIntersection, gizmoObj.position)
            .applyQuaternion(inverseGizmoQuaternion)
            .multiply(constraint)
          translationVector.applyQuaternion(gizmoObj.quaternion)
          gizmoObj.position.add(translationVector)
          if (shouldSnap) {
            prevPos.copy(gizmoObj.position)
            constraintVector.copy(constraint).applyQuaternion(gizmoObj.quaternion)

            const snapValue = editorControlComponent.translationSnap
            gizmoObj.position.set(
              constraintVector.x !== 0 ? Math.round(gizmoObj.position.x / snapValue) * snapValue : gizmoObj.position.x,
              constraintVector.y !== 0 ? Math.round(gizmoObj.position.y / snapValue) * snapValue : gizmoObj.position.y,
              constraintVector.z !== 0 ? Math.round(gizmoObj.position.z / snapValue) * snapValue : gizmoObj.position.z
            )

            translationVector.set(
              translationVector.x + gizmoObj.position.x - prevPos.x,
              translationVector.y + gizmoObj.position.y - prevPos.y,
              translationVector.z + gizmoObj.position.z - prevPos.z
            )
          }

          CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.POSITION, {
            positions: translationVector,
            space: editorControlComponent.transformSpace,
            addToPosition: true
          })

          if (isGrabbing && editorControlComponent.transformMode === TransformMode.Grab) {
            editorControlComponent.grabHistoryCheckpoint = CommandManager.instance.selected
              ? CommandManager.instance.selected[0].entity
              : (0 as Entity)
          }
        } else if (editorControlComponent.transformMode === TransformMode.Rotate) {
          if (selectStartAndNoGrabbing) {
            initRotationDrag.subVectors(planeIntersection, dragOffset).sub(gizmoObj.position)
            prevRotationAngle = 0
          }
          curRotationDrag.subVectors(planeIntersection, dragOffset).sub(gizmoObj.position)
          normalizedInitRotationDrag.copy(initRotationDrag).normalize()
          normalizedCurRotationDrag.copy(curRotationDrag).normalize()
          let rotationAngle = curRotationDrag.angleTo(initRotationDrag)
          rotationAngle *= normalizedInitRotationDrag.cross(normalizedCurRotationDrag).dot(planeNormal) > 0 ? 1 : -1

          if (shouldSnap) {
            const rotationSnapAngle = MathUtils.DEG2RAD * editorControlComponent.rotationSnap
            rotationAngle = Math.round(rotationAngle / rotationSnapAngle) * rotationSnapAngle
          }

          const relativeRotationAngle = rotationAngle - prevRotationAngle
          prevRotationAngle = rotationAngle

          CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
            pivot: gizmoObj.position,
            axis: planeNormal,
            angle: relativeRotationAngle
          })

          const selectedAxisInfo = gizmoObj.selectedAxisObj?.axisInfo!
          if (selectStartAndNoGrabbing) {
            selectedAxisInfo.startMarker!.visible = true
            selectedAxisInfo.endMarker!.visible = true
            if (editorControlComponent.transformSpace !== TransformSpace.World) {
              selectedAxisInfo.startMarkerLocal!.position.copy(gizmoObj.position)
              selectedAxisInfo.startMarkerLocal!.quaternion.copy(gizmoObj.quaternion)
              selectedAxisInfo.startMarkerLocal!.scale.copy(gizmoObj.scale)
              Engine.scene.add(selectedAxisInfo.startMarkerLocal!)
            }
          }

          if (editorControlComponent.transformSpace === TransformSpace.World) {
            if (!selectedAxisInfo.rotationTarget) {
              throw new Error(
                `Couldn't rotate object due to an unknown error. The selected axis is ${
                  (gizmoObj as any).selectedAxis.name
                } The selected axis info is: ${JSON.stringify(selectedAxisInfo)}`
              )
            }
            selectedAxisInfo.rotationTarget.rotateOnAxis(selectedAxisInfo.planeNormal, relativeRotationAngle)
          } else {
            gizmoObj.rotateOnAxis(selectedAxisInfo.planeNormal, relativeRotationAngle)
          }

          if (selectEnd) {
            selectedAxisInfo.startMarker!.visible = false
            selectedAxisInfo.endMarker!.visible = false
            selectedAxisInfo.rotationTarget!.rotation.set(0, 0, 0)
            if (editorControlComponent.transformSpace !== TransformSpace.World) {
              const startMarkerLocal = selectedAxisInfo.startMarkerLocal
              if (startMarkerLocal) Engine.scene.remove(startMarkerLocal)
            }
          }
        } else if (editorControlComponent.transformMode === TransformMode.Scale) {
          dragVector.copy(planeIntersection).applyQuaternion(inverseGizmoQuaternion).multiply(constraint)

          if (selectStartAndNoGrabbing) {
            initDragVector.copy(dragVector)
            prevScale.set(1, 1, 1)
          }
          deltaDragVector.subVectors(dragVector, initDragVector)
          deltaDragVector.multiply(constraint)

          let scaleFactor =
            gizmoObj.selectedAxis === TransformAxis.XYZ
              ? 1 +
                Engine.camera.getWorldDirection(viewDirection).applyQuaternion(gizmoObj.quaternion).dot(deltaDragVector)
              : 1 + constraint.dot(deltaDragVector)

          curScale.set(
            constraint.x === 0 ? 1 : scaleFactor,
            constraint.y === 0 ? 1 : scaleFactor,
            constraint.z === 0 ? 1 : scaleFactor
          )

          if (shouldSnap) {
            curScale
              .divideScalar(editorControlComponent.scaleSnap)
              .round()
              .multiplyScalar(editorControlComponent.scaleSnap)
          }

          curScale.set(
            curScale.x <= 0 ? Number.EPSILON : curScale.x,
            curScale.y <= 0 ? Number.EPSILON : curScale.y,
            curScale.z <= 0 ? Number.EPSILON : curScale.z
          )
          scaleVector.copy(curScale).divide(prevScale)
          prevScale.copy(curScale)

          CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.SCALE, {
            scales: scaleVector,
            space: editorControlComponent.transformSpace
          })
        }
      }

      editorControlComponent.selectionChanged = false
      editorControlComponent.transformModeChanged = false
      editorControlComponent.transformPivotChanged = false
      editorControlComponent.transformSpaceChanged = false

      cameraComponent = getComponent(Engine.activeCameraEntity, EditorCameraComponent)
      const shift = getInput(EditorActionSet.shift)

      if (selectEnd) {
        const boost = getInput(FlyActionSet.boost)
        if (editorControlComponent.transformMode === TransformMode.Grab) {
          setTransformMode(
            shift || boost ? TransformMode.Placement : editorControlComponent.transformModeOnCancel,
            false,
            editorControlComponent
          )
        } else if (editorControlComponent.transformMode === TransformMode.Placement) {
          if (shift || boost || editorControlComponent.multiplePlacement) {
            CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.DUPLICATE_OBJECTS, {
              isObjectSelected: false
            })
          } else {
            setTransformMode(editorControlComponent.transformModeOnCancel, false, editorControlComponent)
          }
        } else {
          const selectEndPosition = getInput(EditorActionSet.selectEndPosition)
          if (editorControlComponent.selectStartPosition.distanceTo(selectEndPosition) < SELECT_SENSITIVITY) {
            const result = getIntersectingNodeOnScreen(raycaster, selectEndPosition)
            if (result) {
              CommandManager.instance.executeCommandWithHistory(
                shift ? EditorCommands.TOGGLE_SELECTION : EditorCommands.REPLACE_SELECTION,
                result.node!
              )
            } else if (!shift) {
              CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
            }
          }
          SceneManager.instance.transformGizmo.deselectAxis()
          editorControlComponent.dragging = false
        }
      }
      if (getInput(EditorActionSet.rotateLeft)) {
        CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
          pivot: SceneManager.instance.transformGizmo.position,
          axis: new Vector3(0, 1, 0),
          angle: editorControlComponent.rotationSnap * MathUtils.DEG2RAD
        })
      } else if (getInput(EditorActionSet.rotateRight)) {
        CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
          pivot: SceneManager.instance.transformGizmo.position,
          axis: new Vector3(0, 1, 0),
          angle: -editorControlComponent.rotationSnap * MathUtils.DEG2RAD
        })
      } else if (getInput(EditorActionSet.grab)) {
        if (
          editorControlComponent.transformMode === TransformMode.Grab ||
          editorControlComponent.transformMode === TransformMode.Placement
        ) {
          cancel(editorControlComponent)
        }
        if (CommandManager.instance.selected.length > 0) {
          setTransformMode(TransformMode.Grab, false, editorControlComponent)
        }
      } else if (getInput(EditorActionSet.cancel)) {
        cancel(editorControlComponent)
      } else if (getInput(EditorActionSet.focusSelection)) {
        cameraComponent.focusedObjects = CommandManager.instance.selected
        cameraComponent.dirty = true
      } else if (getInput(EditorActionSet.setTranslateMode)) {
        setTransformMode(TransformMode.Translate, false, editorControlComponent)
      } else if (getInput(EditorActionSet.setRotateMode)) {
        setTransformMode(TransformMode.Rotate, false, editorControlComponent)
      } else if (getInput(EditorActionSet.setScaleMode)) {
        setTransformMode(TransformMode.Scale, false, editorControlComponent)
      } else if (getInput(EditorActionSet.toggleSnapMode)) {
        toggleSnapMode(editorControlComponent)
      } else if (getInput(EditorActionSet.toggleTransformPivot)) {
        toggleTransformPivot(editorControlComponent)
      } else if (getInput(EditorActionSet.toggleTransformSpace)) {
        toggleTransformSpace(editorControlComponent)
      } else if (getInput(EditorActionSet.incrementGridHeight)) {
        SceneManager.instance.grid.incrementGridHeight()
      } else if (getInput(EditorActionSet.decrementGridHeight)) {
        SceneManager.instance.grid.decrementGridHeight()
      } else if (getInput(EditorActionSet.undo)) {
        CommandManager.instance.undo()
      } else if (getInput(EditorActionSet.redo)) {
        CommandManager.instance.redo()
      } else if (getInput(EditorActionSet.deleteSelected)) {
        CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS, {
          deselectObject: true
        })
      }

      if (flyControlComponent.enable) return

      const selecting = getInput(EditorActionSet.selecting)
      const zoomDelta = getInput(EditorActionSet.zoomDelta)
      const focusPosition = getInput(EditorActionSet.focusPosition)
      const orbiting = selecting && !editorControlComponent.dragging

      if (zoomDelta !== 0) {
        cameraComponent.zoomDelta = zoomDelta
        cameraComponent.dirty = true
      } else if (focusPosition) {
        raycasterResults.length = 0
        const result = getIntersectingNodeOnScreen(raycaster, focusPosition, raycasterResults)
        if (result) {
          cameraComponent.dirty = true
          cameraComponent.focusedObjects = [result.node]
          cameraComponent.refocus = true
        }
      } else if (getInput(EditorActionSet.panning)) {
        cameraComponent.isPanning = true
        cameraComponent.cursorDeltaX = getInput(EditorActionSet.cursorDeltaX)
        cameraComponent.cursorDeltaY = getInput(EditorActionSet.cursorDeltaY)
        cameraComponent.dirty = true
      } else if (orbiting) {
        cameraComponent.isOrbiting = true
        cameraComponent.cursorDeltaX = getInput(EditorActionSet.cursorDeltaX)
        cameraComponent.cursorDeltaY = getInput(EditorActionSet.cursorDeltaY)
        cameraComponent.dirty = true
      }
    }
  }
}

export const setTransformMode = (
  mode: TransformModeType,
  multiplePlacement?: boolean,
  editorControlComponent?: EditorControlComponentType
): void => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  if (
    (mode === TransformMode.Placement || mode === TransformMode.Grab) &&
    CommandManager.instance.selected.some((node) => hasComponent(node.entity, DisableTransformTagComponent)) // TODO: THIS doesn't prevent nesting and then grabbing
  ) {
    // Dont allow grabbing / placing objects with transform disabled.
    return
  }

  if (mode !== TransformMode.Placement && mode !== TransformMode.Grab) {
    editorControlComponent.transformModeOnCancel = mode
  }

  editorControlComponent.multiplePlacement = multiplePlacement || false
  editorControlComponent.grabHistoryCheckpoint = undefined
  editorControlComponent.transformMode = mode
  editorControlComponent.transformModeChanged = true
  SceneManager.instance.transformGizmo.setTransformMode(mode)
  CommandManager.instance.emitEvent(EditorEvents.TRANSFROM_MODE_CHANGED, mode)
}

export const setSnapMode = (snapMode: SnapModeType, editorControlComponent?: EditorControlComponentType): void => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  editorControlComponent.snapMode = snapMode
  CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
}

export const toggleSnapMode = (editorControlComponent?: EditorControlComponentType): void => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  setSnapMode(
    editorControlComponent.snapMode === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled,
    editorControlComponent
  )
}

export const setTransformPivot = (pivot: TransformPivotType, editorControlComponent?: EditorControlComponentType) => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  editorControlComponent.transformPivot = pivot
  editorControlComponent.transformPivotChanged = true
  CommandManager.instance.emitEvent(EditorEvents.TRANSFORM_PIVOT_CHANGED)
}

export const toggleTransformPivot = (editorControlComponent?: EditorControlComponentType) => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  const pivots = Object.keys(TransformPivot)
  const nextIndex = (pivots.indexOf(editorControlComponent.transformPivot) + 1) % pivots.length

  setTransformPivot(TransformPivot[pivots[nextIndex]], editorControlComponent)
}

export const setTransformSpace = (
  transformSpace: TransformSpace,
  editorControlComponent?: EditorControlComponentType
) => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  editorControlComponent.transformSpace = transformSpace
  editorControlComponent.transformSpaceChanged = true
  CommandManager.instance.emitEvent(EditorEvents.TRANSFORM_SPACE_CHANGED)
}

export const toggleTransformSpace = (editorControlComponent?: EditorControlComponentType) => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  setTransformSpace(
    editorControlComponent.transformSpace === TransformSpace.World
      ? TransformSpace.LocalSelection
      : TransformSpace.World,
    editorControlComponent
  )
}

const cancel = (editorControlComponent?: EditorControlComponentType) => {
  if (!editorControlComponent) {
    editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (!editorControlComponent.enable) return
  }

  if (editorControlComponent.transformMode === TransformMode.Grab) {
    setTransformMode(editorControlComponent.transformModeOnCancel, false, editorControlComponent)
    CommandManager.instance.revert(editorControlComponent.grabHistoryCheckpoint)
  } else if (editorControlComponent.transformMode === TransformMode.Placement) {
    setTransformMode(editorControlComponent.transformModeOnCancel, false, editorControlComponent)
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS, {
      deselectObject: true
    })
  }

  CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
}
