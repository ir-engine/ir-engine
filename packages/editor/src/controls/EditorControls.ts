import {
  TransformAxis,
  TransformAxisConstraints,
  TransformMode,
  TransformPivot
} from '@xrengine/engine/src/scene/constants/transformConstants'
import EventEmitter from 'eventemitter3'
import {
  Box3,
  Layers,
  MathUtils as _Math,
  Matrix3,
  PerspectiveCamera,
  Plane,
  Quaternion,
  Ray,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3
} from 'three'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { TransformSpace } from '../constants/TransformSpace'
import getIntersectingNode from '../functions/getIntersectingNode'
import { EditorActionSet, EditorMapping, FlyActionSet, FlyMapping, ActionSets } from './input-mappings'
import { SceneManager } from '../managers/SceneManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorCameraComponent } from '../classes/EditorCameraComponent'
import { FlyControlComponent } from '../classes/FlyControlComponent'
import InputManager from './InputManager'
import { addInputActionMapping, getInput, removeInputActionMapping } from '../functions/parseInputActionMapping'

export const SnapMode = {
  Disabled: 'Disabled',
  Grid: 'Grid'
}
const viewDirection = new Vector3()
function sortDistance(a, b) {
  return a.distance - b.distance
}
export default class EditorControls extends EventEmitter {
  camera: PerspectiveCamera
  inputManager: InputManager
  flyControls: any
  enabled: boolean
  normalMatrix: Matrix3
  vector: Vector3
  delta: Vector3
  center: Vector3
  spherical: Spherical
  panSpeed: number
  zoomSpeed: number
  orbitSpeed: number
  lookSensitivity: number
  selectSensitivity: number
  boostSpeed: number
  moveSpeed: number
  initialLookSensitivity: any
  initialBoostSpeed: any
  initialMoveSpeed: any
  distance: number
  maxFocusDistance: number
  raycaster: Raycaster
  raycasterResults: any[]
  box: Box3
  sphere: Sphere
  centerViewportPosition: Vector2
  raycastIgnoreLayers: Layers
  renderableLayers: Layers
  transformMode: string
  multiplePlacement: boolean
  transformModeOnCancel: string
  transformSpace: TransformSpace
  transformPivot: string
  transformAxis: any
  grabHistoryCheckpoint: any
  placementObjects: any[]
  snapMode: string
  translationSnap: number
  rotationSnap: number
  scaleSnap: number
  selectionBoundingBox: Box3
  selectStartPosition: Vector2
  selectEndPosition: Vector2
  inverseGizmoQuaternion: Quaternion
  dragOffset: Vector3
  transformRay: Ray
  transformPlane: Plane
  planeIntersection: Vector3
  planeNormal: Vector3
  translationVector: Vector3
  initRotationDragVector: Vector3
  prevRotationAngle: number
  curRotationDragVector: Vector3
  normalizedInitRotationDragVector: Vector3
  normalizedCurRotationDragVector: Vector3
  initDragVector: Vector3
  dragVector: Vector3
  deltaDragVector: Vector3
  prevScale: Vector3
  curScale: Vector3
  scaleVector: Vector3
  dragging: boolean
  selectionChanged: boolean
  transformPropertyChanged: boolean
  transformModeChanged: boolean
  transformPivotChanged: boolean
  transformSpaceChanged: boolean
  flyStartTime: number
  flyModeSensitivity: number
  constructor(camera, inputManager, flyControls) {
    super()
    this.camera = camera
    this.inputManager = inputManager
    this.flyControls = flyControls
    this.enabled = false
    this.normalMatrix = new Matrix3()
    this.vector = new Vector3()
    this.delta = new Vector3()
    this.center = new Vector3()
    this.spherical = new Spherical()
    this.panSpeed = 1
    this.zoomSpeed = 0.1
    this.orbitSpeed = 5
    this.lookSensitivity = 5
    this.selectSensitivity = 0.001
    this.boostSpeed = 4
    this.moveSpeed = 4
    this.initialLookSensitivity = flyControls.lookSensitivity
    this.initialBoostSpeed = flyControls.boostSpeed
    this.initialMoveSpeed = flyControls.moveSpeed
    this.distance = 0
    this.maxFocusDistance = 1000
    this.raycaster = new Raycaster()
    this.raycasterResults = []
    this.box = new Box3()
    this.sphere = new Sphere()
    this.centerViewportPosition = new Vector2()
    this.raycastIgnoreLayers = new Layers()
    this.raycastIgnoreLayers.set(1)
    this.renderableLayers = new Layers()
    this.transformMode = TransformMode.Translate
    this.multiplePlacement = false
    this.transformModeOnCancel = TransformMode.Translate
    this.transformSpace = TransformSpace.World
    this.transformPivot = TransformPivot.Selection
    this.transformAxis = null
    this.grabHistoryCheckpoint = null
    this.placementObjects = []
    this.snapMode = SnapMode.Grid
    this.translationSnap = 0.5
    this.rotationSnap = 10
    this.scaleSnap = 0.1
    this.selectionBoundingBox = new Box3()
    this.selectStartPosition = new Vector2()
    this.selectEndPosition = new Vector2()
    this.inverseGizmoQuaternion = new Quaternion()
    this.dragOffset = new Vector3()
    this.transformRay = new Ray()
    this.transformPlane = new Plane()
    this.planeIntersection = new Vector3()
    this.planeNormal = new Vector3()
    this.translationVector = new Vector3()
    this.initRotationDragVector = new Vector3()
    this.prevRotationAngle = 0
    this.curRotationDragVector = new Vector3()
    this.normalizedInitRotationDragVector = new Vector3()
    this.normalizedCurRotationDragVector = new Vector3()
    this.initDragVector = new Vector3()
    this.dragVector = new Vector3()
    this.deltaDragVector = new Vector3()
    this.prevScale = new Vector3()
    this.curScale = new Vector3()
    this.scaleVector = new Vector3()
    this.dragging = false
    this.selectionChanged = true
    this.transformPropertyChanged = true
    this.transformModeChanged = true
    this.transformPivotChanged = true
    this.transformSpaceChanged = true
    this.flyStartTime = 0
    this.flyModeSensitivity = 0.25
    CommandManager.instance.addListener(EditorEvents.BEFORE_SELECTION_CHANGED.toString(), this.onBeforeSelectionChanged)
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), this.onSelectionChanged)
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
  }

  dispose() {
    CommandManager.instance.removeListener(
      EditorEvents.BEFORE_SELECTION_CHANGED.toString(),
      this.onBeforeSelectionChanged
    )
    CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), this.onSelectionChanged)
    CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
  }

  onBeforeSelectionChanged = () => {
    if (this.transformMode === TransformMode.Grab) {
      const checkpoint = this.grabHistoryCheckpoint
      this.setTransformMode(this.transformModeOnCancel)
      CommandManager.instance.revert(checkpoint)
    } else if (this.transformMode === TransformMode.Placement) {
      this.setTransformMode(this.transformModeOnCancel)
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS)
    }
  }
  onSelectionChanged = () => {
    this.selectionChanged = true
  }
  onObjectsChanged = (_objects, property) => {
    if (property === 'position' || property === 'rotation' || property === 'scale' || property === 'matrix') {
      this.transformPropertyChanged = true
    }
  }
  enable() {
    this.enabled = true
    addInputActionMapping(ActionSets.EDITOR, EditorMapping)
  }
  disable() {
    this.enabled = false
    removeInputActionMapping(ActionSets.EDITOR)
  }

  onMouseUp = (e) => {
    const flyControlComponent = getComponent(SceneManager.instance.editorEntity, FlyControlComponent)
    if (flyControlComponent.enabled && e.button === 2) {
      if (document.pointerLockElement === this.inputManager.canvas) {
        document.exitPointerLock()
      }
    }
  }

  update() {
    if (!this.enabled) return

    const flyControlComponent = getComponent(SceneManager.instance.editorEntity, FlyControlComponent)
    if (getInput(EditorActionSet.enableFlyMode)) {
      this.flyStartTime = performance.now()
      this.distance = this.camera.position.distanceTo(this.center)
    } else if (getInput(EditorActionSet.disableFlyMode)) {
      flyControlComponent.enable = false
      removeInputActionMapping(ActionSets.FLY)
      this.inputManager.canvas.removeEventListener('mouseup', this.onMouseUp)
      this.center.addVectors(
        this.camera.position,
        this.vector.set(0, 0, -this.distance).applyMatrix3(this.normalMatrix.getNormalMatrix(this.camera.matrix))
      )
      CommandManager.instance.emitEvent(EditorEvents.FLY_MODE_CHANGED)
      if (performance.now() - this.flyStartTime < this.flyModeSensitivity * 1000) {
        this.cancel()
      }
    }

    const flying = getInput(EditorActionSet.flying)
    if (flying && !this.flyControls.enabled && performance.now() - this.flyStartTime > 100) {
      flyControlComponent.enable = true
      flyControlComponent.lookSensitivity = this.lookSensitivity
      flyControlComponent.moveSpeed = this.moveSpeed
      flyControlComponent.boostSpeed = this.boostSpeed

      addInputActionMapping(ActionSets.FLY, FlyMapping)
      this.inputManager.canvas.addEventListener('mouseup', this.onMouseUp)

      CommandManager.instance.emitEvent(EditorEvents.FLY_MODE_CHANGED)
    }

    const shift = getInput(EditorActionSet.shift)
    const selected = CommandManager.instance.selected
    const selectedTransformRoots = CommandManager.instance.selectedTransformRoots
    const modifier = getInput(EditorActionSet.modifier)
    let grabStart = false

    if (this.transformModeChanged) {
      SceneManager.instance.transformGizmo.setTransformMode(this.transformMode)
      if (this.transformMode === TransformMode.Grab || this.transformMode === TransformMode.Placement) {
        grabStart = true
      }
    }

    const selectStart =
      getInput(EditorActionSet.selectStart) &&
      !flying &&
      this.transformMode !== TransformMode.Grab &&
      this.transformMode !== TransformMode.Placement

    if (selectedTransformRoots.length > 0 && this.transformMode !== TransformMode.Disabled) {
      const lastSelectedObject = selected[selected.length - 1]
      if (
        this.selectionChanged ||
        this.transformModeChanged ||
        this.transformPivotChanged ||
        this.transformPropertyChanged
      ) {
        if (this.transformPivot === TransformPivot.Selection) {
          lastSelectedObject.getWorldPosition(SceneManager.instance.transformGizmo.position)
        } else {
          this.selectionBoundingBox.makeEmpty()
          for (let i = 0; i < selectedTransformRoots.length; i++) {
            this.selectionBoundingBox.expandByObject(selectedTransformRoots[i])
          }
          if (this.transformPivot === TransformPivot.Center) {
            this.selectionBoundingBox.getCenter(SceneManager.instance.transformGizmo.position)
          } else {
            SceneManager.instance.transformGizmo.position.x =
              (this.selectionBoundingBox.max.x + this.selectionBoundingBox.min.x) / 2
            SceneManager.instance.transformGizmo.position.y = this.selectionBoundingBox.min.y
            SceneManager.instance.transformGizmo.position.z =
              (this.selectionBoundingBox.max.z + this.selectionBoundingBox.min.z) / 2
          }
        }
      }
      if (
        this.selectionChanged ||
        this.transformModeChanged ||
        this.transformSpaceChanged ||
        this.transformPropertyChanged
      ) {
        if (this.transformSpace === TransformSpace.LocalSelection) {
          lastSelectedObject.getWorldQuaternion(SceneManager.instance.transformGizmo.quaternion)
        } else {
          SceneManager.instance.transformGizmo.rotation.set(0, 0, 0)
        }
        this.inverseGizmoQuaternion.copy(SceneManager.instance.transformGizmo.quaternion).invert()
      }
      if ((this.transformModeChanged || this.transformSpaceChanged) && this.transformMode === TransformMode.Scale) {
        SceneManager.instance.transformGizmo.setLocalScaleHandlesVisible(this.transformSpace !== TransformSpace.World)
      }
      SceneManager.instance.transformGizmo.visible = true
    } else {
      SceneManager.instance.transformGizmo.visible = false
    }

    this.selectionChanged = false
    this.transformModeChanged = false
    this.transformPivotChanged = false
    this.transformSpaceChanged = false
    // Set up the transformRay
    const cursorPosition = getInput(EditorActionSet.cursorPosition)
    if (selectStart) {
      const selectStartPosition = getInput(EditorActionSet.selectStartPosition)
      this.selectStartPosition.copy(selectStartPosition)
      this.raycaster.setFromCamera(selectStartPosition, this.camera)
      if (SceneManager.instance.transformGizmo.activeControls) {
        this.transformAxis = SceneManager.instance.transformGizmo.selectAxisWithRaycaster(this.raycaster)
        if (this.transformAxis) {
          const axisInfo = (SceneManager.instance.transformGizmo as any).selectedAxis.axisInfo
          this.planeNormal
            .copy(axisInfo.planeNormal)
            .applyQuaternion(SceneManager.instance.transformGizmo.quaternion)
            .normalize()
          this.transformPlane.setFromNormalAndCoplanarPoint(
            this.planeNormal,
            SceneManager.instance.transformGizmo.position
          )
          this.dragging = true
        } else {
          this.dragging = false
        }
      }
    } else if (SceneManager.instance.transformGizmo.activeControls && !this.dragging) {
      this.raycaster.setFromCamera(cursorPosition, this.camera)
      SceneManager.instance.transformGizmo.highlightHoveredAxis(this.raycaster)
    }

    const selectEnd = getInput(EditorActionSet.selectEnd) === 1
    if (this.dragging || this.transformMode === TransformMode.Grab || this.transformMode === TransformMode.Placement) {
      let constraint
      if (this.transformMode === TransformMode.Grab || this.transformMode === TransformMode.Placement) {
        this.getRaycastPosition(flying ? this.centerViewportPosition : cursorPosition, this.planeIntersection, modifier)
        constraint = TransformAxisConstraints.XYZ
      } else {
        this.transformRay.origin.setFromMatrixPosition(this.camera.matrixWorld)
        this.transformRay.direction
          .set(cursorPosition.x, cursorPosition.y, 0.5)
          .unproject(this.camera)
          .sub(this.transformRay.origin)
        this.transformRay.intersectPlane(this.transformPlane, this.planeIntersection)
        constraint = TransformAxisConstraints[this.transformAxis]
      }
      if (!constraint) {
        console.warn(
          `Axis Constraint is undefined. transformAxis was ${this.transformAxis} transformMode was ${this.transformMode} dragging was ${this.dragging}`
        )
      }
      if (selectStart) {
        this.dragOffset.subVectors(SceneManager.instance.transformGizmo.position, this.planeIntersection)
      } else if (grabStart) {
        this.dragOffset.set(0, 0, 0)
      }
      this.planeIntersection.add(this.dragOffset)
      if (
        this.transformMode === TransformMode.Translate ||
        this.transformMode === TransformMode.Grab ||
        this.transformMode === TransformMode.Placement
      ) {
        this.translationVector
          .subVectors(this.planeIntersection, SceneManager.instance.transformGizmo.position)
          .applyQuaternion(this.inverseGizmoQuaternion)
          .multiply(constraint)
        this.translationVector.applyQuaternion(SceneManager.instance.transformGizmo.quaternion)
        SceneManager.instance.transformGizmo.position.add(this.translationVector)
        if (this.shouldSnap(modifier)) {
          const transformPosition = SceneManager.instance.transformGizmo.position
          const prevX = transformPosition.x
          const prevY = transformPosition.y
          const prevZ = transformPosition.z
          const transformedConstraint = new Vector3()
            .copy(constraint)
            .applyQuaternion(SceneManager.instance.transformGizmo.quaternion)
          transformPosition.set(
            transformedConstraint.x !== 0
              ? Math.round(transformPosition.x / this.translationSnap) * this.translationSnap
              : transformPosition.x,
            transformedConstraint.y !== 0
              ? Math.round(transformPosition.y / this.translationSnap) * this.translationSnap
              : transformPosition.y,
            transformedConstraint.z !== 0
              ? Math.round(transformPosition.z / this.translationSnap) * this.translationSnap
              : transformPosition.z
          )
          const diffX = transformPosition.x - prevX
          const diffY = transformPosition.y - prevY
          const diffZ = transformPosition.z - prevZ

          this.translationVector.set(
            this.translationVector.x + diffX,
            this.translationVector.y + diffY,
            this.translationVector.z + diffZ
          )
        }
        CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.POSITION, {
          positions: this.translationVector,
          space: this.transformSpace,
          addToPosition: true
        })

        if (grabStart && this.transformMode === TransformMode.Grab) {
          this.grabHistoryCheckpoint = CommandManager.instance.selected ? CommandManager.instance.selected[0].id : 0
        }
      } else if (this.transformMode === TransformMode.Rotate) {
        if (selectStart) {
          this.initRotationDragVector
            .subVectors(this.planeIntersection, this.dragOffset)
            .sub(SceneManager.instance.transformGizmo.position)
          this.prevRotationAngle = 0
        }
        this.curRotationDragVector
          .subVectors(this.planeIntersection, this.dragOffset)
          .sub(SceneManager.instance.transformGizmo.position)
        this.normalizedInitRotationDragVector.copy(this.initRotationDragVector).normalize()
        this.normalizedCurRotationDragVector.copy(this.curRotationDragVector).normalize()
        let rotationAngle = this.curRotationDragVector.angleTo(this.initRotationDragVector)
        rotationAngle *=
          this.normalizedInitRotationDragVector.cross(this.normalizedCurRotationDragVector).dot(this.planeNormal) > 0
            ? 1
            : -1
        if (this.shouldSnap(modifier)) {
          const rotationSnapAngle = _Math.DEG2RAD * this.rotationSnap
          rotationAngle = Math.round(rotationAngle / rotationSnapAngle) * rotationSnapAngle
        }
        const relativeRotationAngle = rotationAngle - this.prevRotationAngle
        this.prevRotationAngle = rotationAngle
        CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
          pivot: SceneManager.instance.transformGizmo.position,
          axis: this.planeNormal,
          angle: relativeRotationAngle
        })
        const selectedAxisInfo = (SceneManager.instance.transformGizmo as any).selectedAxis.axisInfo
        if (selectStart) {
          selectedAxisInfo.startMarker.visible = true
          selectedAxisInfo.endMarker.visible = true
          if (this.transformSpace !== TransformSpace.World) {
            const startMarkerLocal = selectedAxisInfo.startMarkerLocal
            startMarkerLocal.position.copy(SceneManager.instance.transformGizmo.position)
            startMarkerLocal.quaternion.copy(SceneManager.instance.transformGizmo.quaternion)
            startMarkerLocal.scale.copy(SceneManager.instance.transformGizmo.scale)
            Engine.scene.add(startMarkerLocal)
          }
        }
        if (this.transformSpace === TransformSpace.World) {
          if (!selectedAxisInfo.rotationTarget) {
            throw new Error(
              `Couldn't rotate object due to an unknown error. The selected axis is ${
                (SceneManager.instance.transformGizmo as any).selectedAxis.name
              } The selected axis info is: ${JSON.stringify(selectedAxisInfo)}`
            )
          }
          selectedAxisInfo.rotationTarget.rotateOnAxis(selectedAxisInfo.planeNormal, relativeRotationAngle)
        } else {
          SceneManager.instance.transformGizmo.rotateOnAxis(selectedAxisInfo.planeNormal, relativeRotationAngle)
        }
        if (selectEnd) {
          selectedAxisInfo.startMarker.visible = false
          selectedAxisInfo.endMarker.visible = false
          selectedAxisInfo.rotationTarget.rotation.set(0, 0, 0)
          if (this.transformSpace !== TransformSpace.World) {
            const startMarkerLocal = selectedAxisInfo.startMarkerLocal
            Engine.scene.remove(startMarkerLocal)
          }
        }
      } else if (this.transformMode === TransformMode.Scale) {
        this.dragVector.copy(this.planeIntersection).applyQuaternion(this.inverseGizmoQuaternion).multiply(constraint)
        if (selectStart) {
          this.initDragVector.copy(this.dragVector)
          this.prevScale.set(1, 1, 1)
        }
        this.deltaDragVector.subVectors(this.dragVector, this.initDragVector)
        this.deltaDragVector.multiply(constraint)
        let scaleFactor
        if (this.transformAxis === TransformAxis.XYZ) {
          scaleFactor =
            1 +
            this.camera
              .getWorldDirection(viewDirection)
              .applyQuaternion(SceneManager.instance.transformGizmo.quaternion)
              .dot(this.deltaDragVector)
        } else {
          scaleFactor = 1 + constraint.dot(this.deltaDragVector)
        }
        this.curScale.set(
          constraint.x === 0 ? 1 : scaleFactor,
          constraint.y === 0 ? 1 : scaleFactor,
          constraint.z === 0 ? 1 : scaleFactor
        )
        if (this.shouldSnap(modifier)) {
          this.curScale.divideScalar(this.scaleSnap).round().multiplyScalar(this.scaleSnap)
        }
        this.curScale.set(
          this.curScale.x <= 0 ? Number.EPSILON : this.curScale.x,
          this.curScale.y <= 0 ? Number.EPSILON : this.curScale.y,
          this.curScale.z <= 0 ? Number.EPSILON : this.curScale.z
        )
        this.scaleVector.copy(this.curScale).divide(this.prevScale)
        this.prevScale.copy(this.curScale)

        CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.SCALE, {
          scales: this.scaleVector,
          space: this.transformSpace
        })
      }
    }

    const cameraComponent = getComponent(SceneManager.instance.cameraEntity, EditorCameraComponent)

    if (selectEnd) {
      if (this.transformMode === TransformMode.Grab || this.transformMode === TransformMode.Placement) {
        if (this.transformMode === TransformMode.Grab) {
          if (shift || getInput(FlyActionSet.boost)) {
            this.setTransformMode(TransformMode.Placement)
          } else {
            this.setTransformMode(this.transformModeOnCancel)
          }
        }
        if (this.transformMode === TransformMode.Placement) {
          if (shift || getInput(FlyActionSet.boost) || this.multiplePlacement) {
            CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.DUPLICATE_OBJECTS, {
              isObjectSelected: false
            })
          } else {
            this.setTransformMode(this.transformModeOnCancel)
          }
        }
      } else {
        const selectEndPosition = getInput(EditorActionSet.selectEndPosition)
        if (this.selectStartPosition.distanceTo(selectEndPosition) < this.selectSensitivity) {
          const result = this.raycastNode(selectEndPosition)
          if (result) {
            if (shift) {
              CommandManager.instance.executeCommandWithHistory(EditorCommands.TOGGLE_SELECTION, result.node)
            } else {
              CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, result.node)
            }
          } else if (!shift) {
            CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
          }
        }
        SceneManager.instance.transformGizmo.deselectAxis()
        this.dragging = false
      }
    }
    this.transformPropertyChanged = false
    if (getInput(EditorActionSet.rotateLeft)) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
        pivot: SceneManager.instance.transformGizmo.position,
        axis: new Vector3(0, 1, 0),
        angle: this.rotationSnap * _Math.DEG2RAD
      })
    } else if (getInput(EditorActionSet.rotateRight)) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
        pivot: SceneManager.instance.transformGizmo.position,
        axis: new Vector3(0, 1, 0),
        angle: -this.rotationSnap * _Math.DEG2RAD
      })
    } else if (getInput(EditorActionSet.grab)) {
      if (this.transformMode === TransformMode.Grab || this.transformMode === TransformMode.Placement) {
        this.cancel()
      }
      if (CommandManager.instance.selected.length > 0) {
        this.setTransformMode(TransformMode.Grab)
      }
    } else if (getInput(EditorActionSet.cancel)) {
      this.cancel()
    } else if (getInput(EditorActionSet.focusSelection)) {
      cameraComponent.focusedObjects = CommandManager.instance.selected
      cameraComponent.dirty = true
    } else if (getInput(EditorActionSet.setTranslateMode)) {
      this.setTransformMode(TransformMode.Translate)
    } else if (getInput(EditorActionSet.setRotateMode)) {
      this.setTransformMode(TransformMode.Rotate)
    } else if (getInput(EditorActionSet.setScaleMode)) {
      this.setTransformMode(TransformMode.Scale)
    } else if (getInput(EditorActionSet.toggleSnapMode)) {
      this.toggleSnapMode()
    } else if (getInput(EditorActionSet.toggleTransformPivot)) {
      this.changeTransformPivot()
    } else if (getInput(EditorActionSet.toggleTransformSpace)) {
      this.toggleTransformSpace()
    } else if (getInput(EditorActionSet.incrementGridHeight)) {
      SceneManager.instance.grid.incrementGridHeight()
    } else if (getInput(EditorActionSet.decrementGridHeight)) {
      SceneManager.instance.grid.decrementGridHeight()
    } else if (getInput(EditorActionSet.undo)) {
      CommandManager.instance.undo()
    } else if (getInput(EditorActionSet.redo)) {
      CommandManager.instance.redo()
    } else if (getInput(EditorActionSet.duplicateSelected)) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.DUPLICATE_OBJECTS)
    } else if (getInput(EditorActionSet.groupSelected)) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.GROUP)
    } else if (getInput(EditorActionSet.deleteSelected)) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS)
    } else if (getInput(EditorActionSet.saveProject)) {
      // TODO: Move save to Project class
      CommandManager.instance.emitEvent(EditorEvents.SAVE_PROJECT)
    }

    if (flying) {
      return
    }

    const selecting = getInput(EditorActionSet.selecting)
    const orbiting = selecting && !this.dragging
    const zoomDelta = getInput(EditorActionSet.zoomDelta)
    if (zoomDelta !== 0) {
      cameraComponent.center = this.center
      cameraComponent.zoomDelta = zoomDelta
      cameraComponent.dirty = true
    } else if (getInput(EditorActionSet.focus)) {
      const result = this.raycastNode(getInput(EditorActionSet.focusPosition))
      if (result) {
        cameraComponent.dirty = true
        cameraComponent.focusedObjects = [result.node]
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

  raycastNode(coords) {
    this.raycaster.setFromCamera(coords, this.camera)
    this.raycasterResults.length = 0
    this.raycaster.intersectObject(Engine.scene, true, this.raycasterResults)
    return getIntersectingNode(this.raycasterResults, Engine.scene)
  }

  _raycastRecursive(object, excludeObjects?, excludeLayers?) {
    if (
      (excludeObjects && excludeObjects.indexOf(object) !== -1) ||
      (excludeLayers && excludeLayers.test(object.layers)) ||
      !object.visible
    ) {
      return
    }
    this.raycaster.intersectObject(object, false, this.raycasterResults)
    const children = object.children
    for (let i = 0; i < children.length; i++) {
      this._raycastRecursive(children[i], excludeObjects, excludeLayers)
    }
  }
  getRaycastPosition(coords, target, modifier) {
    this.raycaster.setFromCamera(coords, this.camera)
    this.raycasterResults.length = 0
    this._raycastRecursive(Engine.scene, CommandManager.instance.selectedTransformRoots, this.raycastIgnoreLayers)
    this._raycastRecursive(SceneManager.instance.grid)
    this.raycasterResults.sort(sortDistance)
    const result = this.raycasterResults[0]
    if (result && result.distance < 100) {
      target.copy(result.point)
    } else {
      this.raycaster.ray.at(10, target)
    }
    if (this.shouldSnap(modifier)) {
      const translationSnap = this.translationSnap
      target.set(
        Math.round(target.x / translationSnap) * translationSnap,
        Math.round(target.y / translationSnap) * translationSnap,
        Math.round(target.z / translationSnap) * translationSnap
      )
    }
  }
  setTransformMode(mode, multiplePlacement?) {
    if (
      (mode === TransformMode.Placement || mode === TransformMode.Grab) &&
      CommandManager.instance.selected.some((node) => node.disableTransform) // TODO: this doesn't prevent nesting and then grabbing
    ) {
      // Dont allow grabbing / placing objects with transform disabled.
      return
    }
    if (mode !== TransformMode.Placement && mode !== TransformMode.Grab) {
      this.transformModeOnCancel = mode
    }
    if (mode === TransformMode.Placement) {
      this.placementObjects = CommandManager.instance.selected.slice(0)
    } else {
      this.placementObjects = []
    }
    this.multiplePlacement = multiplePlacement || false
    this.grabHistoryCheckpoint = null
    this.transformMode = mode
    this.transformModeChanged = true
    CommandManager.instance.emitEvent(EditorEvents.TRANSFROM_MODE_CHANGED, mode)
  }
  setTransformSpace(transformSpace) {
    this.transformSpace = transformSpace
    this.transformSpaceChanged = true
    CommandManager.instance.emitEvent(EditorEvents.TRANSFORM_SPACE_CHANGED)
  }
  toggleTransformSpace() {
    this.setTransformSpace(
      this.transformSpace === TransformSpace.World ? TransformSpace.LocalSelection : TransformSpace.World
    )
  }
  setTransformPivot(pivot) {
    this.transformPivot = pivot
    this.transformPivotChanged = true
    CommandManager.instance.emitEvent(EditorEvents.TRANSFORM_PIVOT_CHANGED)
  }
  transformPivotModes = [TransformPivot.Selection, TransformPivot.Center, TransformPivot.Bottom]
  changeTransformPivot() {
    const curPivotModeIndex = this.transformPivotModes.indexOf(this.transformPivot)
    const nextPivotModeIndex = (curPivotModeIndex + 1) % this.transformPivotModes.length
    this.setTransformPivot(this.transformPivotModes[nextPivotModeIndex])
  }
  setSnapMode(snapMode) {
    this.snapMode = snapMode
    CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
  }
  toggleSnapMode() {
    this.setSnapMode(this.snapMode === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled)
  }
  shouldSnap(invertSnap = false) {
    return (this.snapMode === SnapMode.Grid) === !invertSnap
  }
  setTranslationSnap(value) {
    this.translationSnap = value
    SceneManager.instance.grid.setSize(value)
    CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
  }
  setScaleSnap(value) {
    this.scaleSnap = value
    CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
  }
  setRotationSnap(value) {
    this.rotationSnap = value
    CommandManager.instance.emitEvent(EditorEvents.SNAP_SETTINGS_CHANGED)
  }
  cancel() {
    if (this.transformMode === TransformMode.Grab) {
      const checkpoint = this.grabHistoryCheckpoint
      this.setTransformMode(this.transformModeOnCancel)
      CommandManager.instance.revert(checkpoint)
    } else if (this.transformMode === TransformMode.Placement) {
      this.setTransformMode(this.transformModeOnCancel)
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS)
    }
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
  }
}
