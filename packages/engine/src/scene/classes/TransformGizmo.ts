/* eslint-disable @typescript-eslint/no-this-alias */
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

/* eslint-disable @typescript-eslint/ban-types */
import { getState } from '@etherealengine/hyperflux'
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Object3DEventMap,
  OctahedronGeometry,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  SphereGeometry,
  TorusGeometry,
  Vector3
} from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { Q_IDENTITY, V_000, V_001, V_010, V_100 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { UndefinedEntity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import { getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { TransformAxis, TransformMode, TransformSpace } from '../constants/transformConstants'
import { setObjectLayers } from '../functions/setObjectLayers'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.TransformGizmo)
const _tempVector = new Vector3()
const _tempVector2 = new Vector3()
const _tempQuaternion = new Quaternion()
const _unit = {
  X: V_100,
  Y: V_010,
  Z: V_001
}

const _changeEvent = { type: 'change' }
const _mouseDownEvent = { type: 'mouseDown' }
const _mouseUpEvent = { type: 'mouseUp', mode: null }
const _objectChangeEvent = { type: 'objectChange' }

export interface TransformControlsEventMap extends Object3DEventMap {
  change: {}
  mouseDown: {}
  mouseUp: {}
  objectChange: {}
  'camera-changed': { value: unknown }
  'entity-changed': { value: unknown }
  'enabled-changed': { value: unknown }
  'axis-changed': { value: unknown }
  'mode-changed': { value: unknown }
  'translationSnap-changed': { value: unknown }
  'rotationSnap-changed': { value: unknown }
  'scaleSnap-changed': { value: unknown }
  'space-changed': { value: unknown }
  'size-changed': { value: unknown }
  'dragging-changed': { value: unknown }
  'showX-changed': { value: unknown }
  'showY-changed': { value: unknown }
  'showZ-changed': { value: unknown }
  'worldPosition-changed': { value: unknown }
  'worldPositionStart-changed': { value: unknown }
  'worldQuaternion-changed': { value: unknown }
  'worldQuaternionStart-changed': { value: unknown }
  'cameraPosition-changed': { value: unknown }
  'cameraQuaternion-changed': { value: unknown }
  'pointStart-changed': { value: unknown }
  'pointEnd-changed': { value: unknown }
  'rotationAxis-changed': { value: unknown }
  'rotationAngle-changed': { value: unknown }
  'eye-changed': { value: unknown }
}

class TransformControls extends Object3D<TransformControlsEventMap> {
  [x: string]: any
  isTransformControls: boolean
  domElement: any
  private _gizmo: TransformControlsGizmo
  private _plane: TransformControlsPlane
  _offset: Vector3
  _startNorm: Vector3
  _endNorm: Vector3
  _cameraScale: Vector3
  _parentQuaternionInv: Quaternion
  _parentScale: Vector3
  _worldScaleStart: Vector3
  _worldQuaternionInv: Quaternion
  _worldScale: Vector3
  _positionStart: Vector3
  _quaternionStart: Quaternion
  _scaleStart: Vector3
  _getPointer: (event: any) => { x: number; y: number; button: any }
  _onPointerDown: (event: any) => void
  _onPointerHover: (event: any) => void
  _onPointerMove: (event: any) => void
  _onPointerUp: (event: any) => void

  constructor() {
    super()

    this.isTransformControls = true

    this.visible = false
    this.domElement = EngineRenderer.instance.renderer.domElement
    this.domElement.style.touchAction = 'none' // disable touch scroll , hmm the editor window isnt scrollable anyways

    const _gizmo = new TransformControlsGizmo()
    this._gizmo = _gizmo
    this.add(_gizmo)

    const _plane = new TransformControlsPlane()
    this._plane = _plane
    this.add(_plane)

    const scope = this

    /**
     * Define a property on an entity with a default value.
     * @param {string} propName - The name of the property.
     * @param {*} defaultValue - The default value for the property.
     */
    function defineProperty<T>(propName, defaultValue: T) {
      let propValue: T = defaultValue as T

      Object.defineProperty(scope, propName, {
        get: function () {
          return propValue !== undefined ? propValue : defaultValue
        },

        set: function (value: T) {
          if (propValue !== value) {
            propValue = value
            _plane[propName] = value
            _gizmo[propName] = value

            scope.dispatchEvent({ type: (propName + '-changed') as any, value: value })
            scope.dispatchEvent(_changeEvent as any)
          }
        }
      })

      scope[propName] = defaultValue as T
      _plane[propName] = defaultValue as T
      _gizmo[propName] = defaultValue as T
    }

    // Define properties with getters/setter
    // Setting the defined property will automatically trigger change event
    // Defined properties are passed down to gizmo and plane

    defineProperty('camera', getComponent(Engine.instance.cameraEntity, CameraComponent))
    defineProperty('entity', UndefinedEntity)
    defineProperty('enabled', true)
    defineProperty('axis', null)
    defineProperty('mode', TransformMode.translate)
    defineProperty('translationSnap', null)
    defineProperty('rotationSnap', null)
    defineProperty('scaleSnap', null)
    defineProperty('space', TransformSpace.world)
    defineProperty('size', 1)
    defineProperty('dragging', false)
    defineProperty('showX', true)
    defineProperty('showY', true)
    defineProperty('showZ', true)

    // Reusable utility variables

    const worldPosition = new Vector3()
    const worldPositionStart = new Vector3()
    const worldQuaternion = new Quaternion()
    const worldQuaternionStart = new Quaternion()
    const cameraPosition = new Vector3()
    const cameraQuaternion = new Quaternion()
    const pointStart = new Vector3()
    const pointEnd = new Vector3()
    const rotationAxis = new Vector3()
    const rotationAngle = 0
    const eye = new Vector3()

    // TODO: remove properties unused in plane and gizmo

    defineProperty('worldPosition', worldPosition)
    defineProperty('worldPositionStart', worldPositionStart)
    defineProperty('worldQuaternion', worldQuaternion)
    defineProperty('worldQuaternionStart', worldQuaternionStart)
    defineProperty('cameraPosition', cameraPosition)
    defineProperty('cameraQuaternion', cameraQuaternion)
    defineProperty('pointStart', pointStart)
    defineProperty('pointEnd', pointEnd)
    defineProperty('rotationAxis', rotationAxis)
    defineProperty('rotationAngle', rotationAngle)
    defineProperty('eye', eye)

    this._offset = new Vector3()
    this._startNorm = new Vector3()
    this._endNorm = new Vector3()
    this._cameraScale = new Vector3()

    this._parentQuaternionInv = new Quaternion()
    this._parentScale = new Vector3()

    this._worldScaleStart = new Vector3()
    this._worldQuaternionInv = new Quaternion()
    this._worldScale = new Vector3()

    this._positionStart = new Vector3()
    this._quaternionStart = new Quaternion()
    this._scaleStart = new Vector3()

    this._getPointer = getPointer.bind(this)
    this._onPointerDown = onPointerDown.bind(this)
    this._onPointerHover = onPointerHover.bind(this)
    this._onPointerMove = onPointerMove.bind(this)
    this._onPointerUp = onPointerUp.bind(this)

    this.domElement.addEventListener('pointerdown', this._onPointerDown)
    this.domElement.addEventListener('pointermove', this._onPointerHover)
    this.domElement.addEventListener('pointerup', this._onPointerUp)
    setObjectLayers(this, ObjectLayers.TransformGizmo)
  }

  // updateMatrixWorld  updates key transformation variables
  updateMatrixWorld() {
    if (this.entity !== UndefinedEntity) {
      let parentEntity = SceneState.getRootEntity(getState(SceneState).activeScene!) // we can always ensure scene entity is root parent even if entty tree component doesnt exist
      const parent = getComponent(this.entity, EntityTreeComponent)

      if (parent && parent.parentEntity !== UndefinedEntity) {
        parentEntity = parent.parentEntity!
      }

      this._parentScale = getComponent(parentEntity!, TransformComponent).scale

      const currentMatrix = getComponent(this.entity, TransformComponent).matrix
      currentMatrix.decompose(this.worldPosition, this.worldQuaternion, this._worldScale)

      this._parentQuaternionInv.copy(getComponent(parentEntity!, TransformComponent).rotation).invert()
      this._worldQuaternionInv.copy(getComponent(this.entity, TransformComponent).rotation).invert()
    }

    this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this._cameraScale)

    if (this.camera.isOrthographicCamera) {
      this.camera.getWorldDirection(this.eye).negate()
    } else {
      this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize()
    }

    super.updateMatrixWorld(this as any)
  }

  pointerHover(pointer) {
    if (this.entity === UndefinedEntity || this.dragging === true) return

    _raycaster.setFromCamera(pointer, this.camera)

    const intersect = intersectObjectWithRay(this._gizmo.picker[this.mode], _raycaster, true)

    if (intersect) {
      this.axis = intersect.object.name
    } else {
      this.axis = null
    }
  }

  pointerDown(pointer) {
    if (this.entity === UndefinedEntity || this.dragging === true || pointer.button !== 0) return

    if (this.axis !== null) {
      _raycaster.setFromCamera(pointer, this.camera)

      const planeIntersect = intersectObjectWithRay(this._plane, _raycaster, true)

      if (planeIntersect) {
        //this.entity.updateMatrixWorld()
        //this.entity.parent!.updateMatrixWorld()
        const currenttransform = getComponent(this.entity, TransformComponent)
        this._positionStart.copy(currenttransform.position)
        this._quaternionStart.copy(currenttransform.rotation)
        this._scaleStart.copy(currenttransform.scale)

        currenttransform.matrix.decompose(this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart)

        this.pointStart.copy(planeIntersect.point).sub(this.worldPositionStart)
      }

      this.dragging = true
      ;(_mouseDownEvent as any).mode = this.mode
      this.dispatchEvent(_mouseDownEvent as any)
    }
  }

  pointerMove(pointer) {
    const axis = this.axis
    const mode = this.mode
    const entity = this.entity
    let space = this.space

    if (mode === TransformMode.scale) {
      space = TransformSpace.local
    } else if (axis === TransformAxis.E || axis === TransformAxis.XYZE || axis === TransformAxis.XYZ) {
      space = TransformSpace.world
    }

    if (entity === UndefinedEntity || axis === null || this.dragging === false || pointer.button !== -1) return

    _raycaster.setFromCamera(pointer, this.camera)

    const planeIntersect = intersectObjectWithRay(this._plane, _raycaster, true)

    if (!planeIntersect) return

    this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart)

    if (mode === TransformMode.translate) {
      // Apply translate
      const newPosition = getComponent(entity, TransformComponent).position
      this._offset.copy(this.pointEnd).sub(this.pointStart)

      if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
        this._offset.applyQuaternion(this._worldQuaternionInv)
      }

      if (axis.indexOf(TransformAxis.X) === -1) this._offset.x = 0
      if (axis.indexOf(TransformAxis.Y) === -1) this._offset.y = 0
      if (axis.indexOf(TransformAxis.Z) === -1) this._offset.z = 0

      if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
        this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale)
      } else {
        this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale)
      }
      newPosition.copy(this._offset).add(this._positionStart)

      // Apply translation snap

      if (this.translationSnap) {
        if (space === TransformSpace.local) {
          newPosition.applyQuaternion(_tempQuaternion.copy(this._quaternionStart).invert())

          if (axis.search(TransformAxis.X) !== -1) {
            newPosition.x = Math.round(newPosition.x / this.translationSnap) * this.translationSnap
          }

          if (axis.search(TransformAxis.Y) !== -1) {
            newPosition.y = Math.round(newPosition.y / this.translationSnap) * this.translationSnap
          }

          if (axis.search(TransformAxis.Z) !== -1) {
            newPosition.z = Math.round(newPosition.z / this.translationSnap) * this.translationSnap
          }

          newPosition.applyQuaternion(this._quaternionStart)
        }

        if (space === TransformSpace.world) {
          const parent = getComponent(entity, EntityTreeComponent)
          if (parent && parent.parentEntity !== UndefinedEntity) {
            newPosition.add(getComponent(parent.parentEntity!, TransformComponent).position)
          }

          if (axis.search(TransformAxis.X) !== -1) {
            newPosition.x = Math.round(newPosition.x / this.translationSnap) * this.translationSnap
          }

          if (axis.search(TransformAxis.Y) !== -1) {
            newPosition.y = Math.round(newPosition.y / this.translationSnap) * this.translationSnap
          }

          if (axis.search(TransformAxis.Z) !== -1) {
            newPosition.z = Math.round(newPosition.z / this.translationSnap) * this.translationSnap
          }

          if (parent && parent.parentEntity !== UndefinedEntity) {
            newPosition.sub(getComponent(parent.parentEntity!, TransformComponent).position)
          }
        }
      }
      setComponent(entity, TransformComponent, { position: newPosition })
    } else if (mode === TransformMode.scale) {
      if (axis.search(TransformAxis.XYZ) !== -1) {
        let d = this.pointEnd.length() / this.pointStart.length()

        if (this.pointEnd.dot(this.pointStart) < 0) d *= -1

        _tempVector2.set(d, d, d)
      } else {
        _tempVector.copy(this.pointStart)
        _tempVector2.copy(this.pointEnd)

        _tempVector.applyQuaternion(this._worldQuaternionInv)
        _tempVector2.applyQuaternion(this._worldQuaternionInv)

        _tempVector2.divide(_tempVector)

        if (axis.search(TransformAxis.X) === -1) {
          _tempVector2.x = 1
        }

        if (axis.search(TransformAxis.Y) === -1) {
          _tempVector2.y = 1
        }

        if (axis.search(TransformAxis.Z) === -1) {
          _tempVector2.z = 1
        }
      }

      // Apply scale
      const newScale = getComponent(entity, TransformComponent).scale
      newScale.copy(this._scaleStart).multiply(_tempVector2)

      if (this.scaleSnap) {
        if (axis.search(TransformAxis.X) !== -1) {
          newScale.x = Math.round(newScale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap
        }

        if (axis.search(TransformAxis.Y) !== -1) {
          newScale.y = Math.round(newScale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap
        }

        if (axis.search(TransformAxis.Z) !== -1) {
          newScale.z = Math.round(newScale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap
        }
      }
      setComponent(entity, TransformComponent, { scale: newScale })
    } else if (mode === TransformMode.rotate) {
      this._offset.copy(this.pointEnd).sub(this.pointStart)

      const ROTATION_SPEED =
        20 / this.worldPosition.distanceTo(_tempVector.setFromMatrixPosition(this.camera.matrixWorld))

      let _inPlaneRotation = false

      if (axis === TransformAxis.XYZE) {
        this.rotationAxis.copy(this._offset).cross(this.eye).normalize()
        this.rotationAngle = this._offset.dot(_tempVector.copy(this.rotationAxis).cross(this.eye)) * ROTATION_SPEED
      } else if (axis === TransformAxis.X || axis === TransformAxis.Y || axis === TransformAxis.Z) {
        this.rotationAxis.copy(_unit[axis])

        _tempVector.copy(_unit[axis])

        if (space === TransformSpace.local) {
          _tempVector.applyQuaternion(this.worldQuaternion)
        }

        _tempVector.cross(this.eye)

        // When _tempVector is 0 after cross with this.eye the vectors are parallel and should use in-plane rotation logic.
        if (_tempVector.length() === 0) {
          _inPlaneRotation = true
        } else {
          this.rotationAngle = this._offset.dot(_tempVector.normalize()) * ROTATION_SPEED
        }
      }

      if (axis === TransformAxis.E || _inPlaneRotation) {
        this.rotationAxis.copy(this.eye)
        this.rotationAngle = this.pointEnd.angleTo(this.pointStart)

        this._startNorm.copy(this.pointStart).normalize()
        this._endNorm.copy(this.pointEnd).normalize()

        this.rotationAngle *= this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : -1
      }

      // Apply rotation snap

      if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap
      const newRotation = getComponent(entity, TransformComponent).rotation
      // Apply rotate
      if (space === TransformSpace.local && axis !== TransformAxis.E && axis !== TransformAxis.XYZE) {
        newRotation.copy(this._quaternionStart)
        newRotation.multiply(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle)).normalize()
      } else {
        this.rotationAxis.applyQuaternion(this._parentQuaternionInv)
        newRotation.copy(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle))
        newRotation.multiply(this._quaternionStart).normalize()
      }

      setComponent(entity, TransformComponent, { rotation: newRotation })
    }

    this.dispatchEvent(_changeEvent as any)
    this.dispatchEvent(_objectChangeEvent as any)
  }

  pointerUp(pointer) {
    if (pointer.button !== 0) return

    if (this.dragging && this.axis !== null) {
      _mouseUpEvent.mode = this.mode
      this.dispatchEvent(_mouseUpEvent as any)
    }
    // integrate it directly here
    this.dragging = false
    this.axis = null
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this._onPointerDown)
    this.domElement.removeEventListener('pointermove', this._onPointerHover)
    this.domElement.removeEventListener('pointermove', this._onPointerMove)
    this.domElement.removeEventListener('pointerup', this._onPointerUp)

    this.traverse(function (child: Mesh) {
      if (child.geometry) child.geometry.dispose()
      if (child.material) (child.material as Material).dispose()
    })
  }

  // Set current entity
  attach(entity) {
    this.entity = entity

    this.visible = true

    return this
  }

  // Detach from entity
  detach() {
    this.entity = UndefinedEntity
    this.visible = false
    this.axis = null

    return this
  }

  reset() {
    if (!this.enabled) return

    if (this.dragging) {
      setComponent(this.entity, TransformComponent, {
        position: this._positionStart,
        rotation: this._quaternionStart,
        scale: this._scaleStart
      })

      this.dispatchEvent(_changeEvent as any)
      this.dispatchEvent(_objectChangeEvent as any)

      this.pointStart.copy(this.pointEnd)
    }
  }

  getRaycaster() {
    return _raycaster
  }

  // TODO: deprecate
  getMode() {
    return this.mode
  }

  setMode(mode) {
    this.mode = mode
  }

  setTranslationSnap(translationSnap) {
    this.translationSnap = translationSnap
  }

  setRotationSnap(rotationSnap) {
    this.rotationSnap = rotationSnap
  }

  setScaleSnap(scaleSnap) {
    this.scaleSnap = scaleSnap
  }

  setSize(size) {
    this.size = size
  }

  setSpace(space) {
    this.space = space
  }
}

// mouse / touch event handlers

function getPointer(event) {
  if (this.domElement.ownerDocument.pointerLockElement) {
    return {
      x: 0,
      y: 0,
      button: event.button
    }
  } else {
    const rect = this.domElement.getBoundingClientRect()

    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      button: event.button
    }
  }
}

function onPointerHover(event) {
  if (!this.enabled) return

  switch (event.pointerType) {
    case 'mouse':
    case 'pen':
      this.pointerHover(this._getPointer(event))
      break
  }
}

function onPointerDown(event) {
  if (!this.enabled) return

  if (!document.pointerLockElement) {
    this.domElement.setPointerCapture(event.pointerId)
  }

  this.domElement.addEventListener('pointermove', this._onPointerMove)

  this.pointerHover(this._getPointer(event))
  this.pointerDown(this._getPointer(event))
}

function onPointerMove(event) {
  if (!this.enabled) return

  this.pointerMove(this._getPointer(event))
}

function onPointerUp(event) {
  if (!this.enabled) return

  this.domElement.releasePointerCapture(event.pointerId)

  this.domElement.removeEventListener('pointermove', this._onPointerMove)

  this.pointerUp(this._getPointer(event))
}

function intersectObjectWithRay(object, raycaster, includeInvisible?) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}

// Reusable utility variables

const _tempEuler = new Euler()
const _alignVector = new Vector3(0, 1, 0)
const _lookAtMatrix = new Matrix4()
const _tempQuaternion2 = new Quaternion()
const _dirVector = new Vector3()
const _tempMatrix = new Matrix4()

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

class TransformControlsGizmo extends Object3D {
  [x: string]: any
  picker: any
  isTransformControlsGizmo: boolean
  gizmo: {}
  helper: {}
  mode: string
  space: any
  worldQuaternion: any
  camera: any
  size: any
  axis: any
  dragging: any
  showX: boolean
  showY: boolean
  showZ: boolean
  enabled: any
  type: any

  constructor() {
    super()

    this.isTransformControlsGizmo = true

    this.type = 'TransformControlsGizmo'
    this.name = 'TransformControlsGizmo'

    // shared materials

    const gizmoMaterial = new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    })

    const gizmoLineMaterial = new LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    })

    // Make unique material for each axis/color

    const matInvisible = gizmoMaterial.clone()
    matInvisible.opacity = 0.15

    const matHelper = gizmoLineMaterial.clone()
    matHelper.opacity = 0.5

    const matRed = gizmoMaterial.clone()
    matRed.color.setHex(0xff0000)

    const matGreen = gizmoMaterial.clone()
    matGreen.color.setHex(0x00ff00)

    const matBlue = gizmoMaterial.clone()
    matBlue.color.setHex(0x0000ff)

    const matRedTransparent = gizmoMaterial.clone()
    matRedTransparent.color.setHex(0xff0000)
    matRedTransparent.opacity = 0.5

    const matGreenTransparent = gizmoMaterial.clone()
    matGreenTransparent.color.setHex(0x00ff00)
    matGreenTransparent.opacity = 0.5

    const matBlueTransparent = gizmoMaterial.clone()
    matBlueTransparent.color.setHex(0x0000ff)
    matBlueTransparent.opacity = 0.5

    const matWhiteTransparent = gizmoMaterial.clone()
    matWhiteTransparent.opacity = 0.25

    const matYellowTransparent = gizmoMaterial.clone()
    matYellowTransparent.color.setHex(0xffff00)
    matYellowTransparent.opacity = 0.25

    const matYellow = gizmoMaterial.clone()
    matYellow.color.setHex(0xffff00)

    const matGray = gizmoMaterial.clone()
    matGray.color.setHex(0x787878)

    // reusable geometry

    const arrowGeometry = new CylinderGeometry(0, 0.04, 0.1, 12)
    arrowGeometry.translate(0, 0.05, 0)

    const scaleHandleGeometry = new BoxGeometry(0.08, 0.08, 0.08)
    scaleHandleGeometry.translate(0, 0.04, 0)

    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3))

    const lineGeometry2 = new CylinderGeometry(0.0075, 0.0075, 0.5, 3)
    lineGeometry2.translate(0, 0.25, 0)

    function CircleGeometry(radius, arc) {
      const geometry = new TorusGeometry(radius, 0.0075, 3, 64, arc * Math.PI * 2)
      geometry.rotateY(Math.PI / 2)
      geometry.rotateX(Math.PI / 2)
      return geometry
    }

    // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

    function TranslateHelperGeometry() {
      const geometry = new BufferGeometry()

      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3))

      return geometry
    }

    // Gizmo definitions - custom hierarchy definitions for setupGizmo() function

    const gizmoTranslate = {
      X: [
        [new Mesh(arrowGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(arrowGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]],
        [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      Y: [
        [new Mesh(arrowGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(arrowGeometry, matGreen), [0, -0.5, 0], [Math.PI, 0, 0]],
        [new Mesh(lineGeometry2, matGreen)]
      ],
      Z: [
        [new Mesh(arrowGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Mesh(arrowGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]],
        [new Mesh(lineGeometry2, matBlue), null, [Math.PI / 2, 0, 0]]
      ],
      XYZ: [[new Mesh(new OctahedronGeometry(0.1, 0), matWhiteTransparent.clone()), [0, 0, 0]]],
      XY: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent.clone()), [0.15, 0.15, 0]]],
      YZ: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [
          new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent.clone()),
          [0.15, 0, 0.15],
          [-Math.PI / 2, 0, 0]
        ]
      ]
    }

    const pickerTranslate = {
      X: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [[new Mesh(new OctahedronGeometry(0.2, 0), matInvisible)]],
      XY: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]],
      YZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
      XZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]]
    }

    const helperTranslate = {
      START: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
      END: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
      DELTA: [[new Line(TranslateHelperGeometry(), matHelper), null, null, null, 'helper']],
      X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
      Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
      Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
    }

    const gizmoRotate = {
      XYZE: [[new Mesh(CircleGeometry(0.5, 1), matGray), null, [0, Math.PI / 2, 0]]],
      X: [[new Mesh(CircleGeometry(0.5, 0.5), matRed)]],
      Y: [[new Mesh(CircleGeometry(0.5, 0.5), matGreen), null, [0, 0, -Math.PI / 2]]],
      Z: [[new Mesh(CircleGeometry(0.5, 0.5), matBlue), null, [0, Math.PI / 2, 0]]],
      E: [[new Mesh(CircleGeometry(0.75, 1), matYellowTransparent), null, [0, Math.PI / 2, 0]]]
    }

    const helperRotate = {
      AXIS: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']]
    }

    const pickerRotate = {
      XYZE: [[new Mesh(new SphereGeometry(0.25, 10, 8), matInvisible)]],
      X: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]],
      Y: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]]],
      Z: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]]],
      E: [[new Mesh(new TorusGeometry(0.75, 0.1, 2, 24), matInvisible)]]
    }

    const gizmoScale = {
      X: [
        [new Mesh(scaleHandleGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(scaleHandleGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(scaleHandleGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(lineGeometry2, matGreen)],
        [new Mesh(scaleHandleGeometry, matGreen), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Mesh(lineGeometry2, matBlue), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [new Mesh(scaleHandleGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
      ],
      XY: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent), [0.15, 0.15, 0]]],
      YZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
      XZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]],
      XYZ: [[new Mesh(new BoxGeometry(0.1, 0.1, 0.1), matWhiteTransparent.clone())]]
    }

    const pickerScale = {
      X: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XY: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]],
      YZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
      XZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]],
      XYZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 0]]]
    }

    const helperScale = {
      X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
      Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
      Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
    }

    // Creates an Object3D with gizmos described in custom hierarchy definition.

    function setupGizmo(gizmoMap) {
      const gizmo = new Object3D()

      for (const name in gizmoMap) {
        for (let i = gizmoMap[name].length; i--; ) {
          const object = gizmoMap[name][i][0].clone()
          const position = gizmoMap[name][i][1]
          const rotation = gizmoMap[name][i][2]
          const scale = gizmoMap[name][i][3]
          const tag = gizmoMap[name][i][4]

          // name and tag properties are essential for picking and updating logic.
          object.name = name
          object.tag = tag

          if (position) {
            object.position.set(position[0], position[1], position[2])
          }

          if (rotation) {
            object.rotation.set(rotation[0], rotation[1], rotation[2])
          }

          if (scale) {
            object.scale.set(scale[0], scale[1], scale[2])
          }

          object.updateMatrix()

          const tempGeometry = object.geometry.clone()
          tempGeometry.applyMatrix4(object.matrix)
          object.geometry = tempGeometry
          object.renderOrder = Infinity

          object.position.set(0, 0, 0)
          object.rotation.set(0, 0, 0)
          object.scale.set(1, 1, 1)

          gizmo.add(object)
        }
      }

      return gizmo
    }

    // Gizmo creation

    this.gizmo = {}
    this.picker = {}
    this.helper = {}

    this.add((this.gizmo[TransformMode.translate] = setupGizmo(gizmoTranslate)))
    this.add((this.gizmo[TransformMode.rotate] = setupGizmo(gizmoRotate)))
    this.add((this.gizmo[TransformMode.scale] = setupGizmo(gizmoScale)))
    this.add((this.picker[TransformMode.translate] = setupGizmo(pickerTranslate)))
    this.add((this.picker[TransformMode.rotate] = setupGizmo(pickerRotate)))
    this.add((this.picker[TransformMode.scale] = setupGizmo(pickerScale)))
    this.add((this.helper[TransformMode.translate] = setupGizmo(helperTranslate)))
    this.add((this.helper[TransformMode.rotate] = setupGizmo(helperRotate)))
    this.add((this.helper[TransformMode.scale] = setupGizmo(helperScale)))

    // Pickers should be hidden always

    this.picker[TransformMode.translate].visible = false
    this.picker[TransformMode.rotate].visible = false
    this.picker[TransformMode.scale].visible = false
  }

  // updateMatrixWorld will update transformations and appearance of individual handles

  updateMatrixWorld(force) {
    const space = this.mode === TransformMode.scale ? TransformSpace.local : this.space // scale always oriented to local rotation

    const quaternion = space === TransformSpace.local ? this.worldQuaternion : Q_IDENTITY

    // Show only gizmos for current transform mode

    this.gizmo[TransformMode.translate].visible = this.mode === TransformMode.translate
    this.gizmo[TransformMode.rotate].visible = this.mode === TransformMode.rotate
    this.gizmo[TransformMode.scale].visible = this.mode === TransformMode.scale

    this.helper[TransformMode.translate].visible = this.mode === TransformMode.translate
    this.helper[TransformMode.rotate].visible = this.mode === TransformMode.rotate
    this.helper[TransformMode.scale].visible = this.mode === TransformMode.scale

    let handles = []
    handles = handles.concat(this.picker[this.mode].children)
    handles = handles.concat(this.gizmo[this.mode].children)
    handles = handles.concat(this.helper[this.mode].children)

    for (let i = 0; i < handles.length; i++) {
      const handle: any = handles[i]

      // hide aligned to camera

      handle.visible = true
      handle.rotation.set(0, 0, 0)
      handle.position.copy(this.worldPosition)

      let factor

      if (this.camera.isOrthographicCamera) {
        factor = (this.camera.top - this.camera.bottom) / this.camera.zoom
      } else {
        factor =
          this.worldPosition.distanceTo(this.cameraPosition) *
          Math.min((1.9 * Math.tan((Math.PI * this.camera.fov) / 360)) / this.camera.zoom, 7)
      }

      handle.scale.set(1, 1, 1).multiplyScalar((factor * this.size) / 4)

      // TODO: simplify helpers and consider decoupling from gizmo

      if (handle.tag === 'helper') {
        handle.visible = false

        if (handle.name === 'AXIS') {
          handle.visible = !!this.axis

          if (this.axis === TransformAxis.X) {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0))
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

            if (Math.abs(_alignVector.copy(_unit[TransformAxis.X]).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
              handle.visible = false
            }
          }

          if (this.axis === TransformAxis.Y) {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2))
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

            if (Math.abs(_alignVector.copy(_unit[TransformAxis.Y]).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
              handle.visible = false
            }
          }

          if (this.axis === TransformAxis.Z) {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

            if (Math.abs(_alignVector.copy(_unit[TransformAxis.Z]).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
              handle.visible = false
            }
          }

          if (this.axis === TransformAxis.XYZE) {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
            _alignVector.copy(this.rotationAxis)
            handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(V_000, _alignVector, _unit[TransformAxis.Y]))
            handle.quaternion.multiply(_tempQuaternion)
            handle.visible = this.dragging
          }

          if (this.axis === TransformAxis.E) {
            handle.visible = false
          }
        } else if (handle.name === 'START') {
          handle.position.copy(this.worldPositionStart)
          handle.visible = this.dragging
        } else if (handle.name === 'END') {
          handle.position.copy(this.worldPosition)
          handle.visible = this.dragging
        } else if (handle.name === 'DELTA') {
          handle.position.copy(this.worldPositionStart)
          handle.quaternion.copy(this.worldQuaternionStart)
          _tempVector.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1)
          _tempVector.applyQuaternion(this.worldQuaternionStart.clone().invert())
          handle.scale.copy(_tempVector)
          handle.visible = this.dragging
        } else {
          handle.quaternion.copy(quaternion)

          if (this.dragging) {
            handle.position.copy(this.worldPositionStart)
          } else {
            handle.position.copy(this.worldPosition)
          }

          if (this.axis) {
            handle.visible = this.axis.search(handle.name) !== -1
          }
        }

        // If updating helper, skip rest of the loop
        continue
      }

      // Align handles to current local or world rotation

      handle.quaternion.copy(quaternion)

      if (this.mode === TransformMode.translate || this.mode === TransformMode.scale) {
        // Hide translate and scale axis facing the camera

        const AXIS_HIDE_THRESHOLD = 0.99
        const PLANE_HIDE_THRESHOLD = 0.2

        if (handle.name === TransformAxis.X) {
          if (
            Math.abs(_alignVector.copy(_unit[TransformAxis.X]).applyQuaternion(quaternion).dot(this.eye)) >
            AXIS_HIDE_THRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === TransformAxis.Y) {
          if (
            Math.abs(_alignVector.copy(_unit[TransformAxis.Y]).applyQuaternion(quaternion).dot(this.eye)) >
            AXIS_HIDE_THRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === TransformAxis.Z) {
          if (
            Math.abs(_alignVector.copy(_unit[TransformAxis.Z]).applyQuaternion(quaternion).dot(this.eye)) >
            AXIS_HIDE_THRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === TransformAxis.XY) {
          if (
            Math.abs(_alignVector.copy(_unit[TransformAxis.Z]).applyQuaternion(quaternion).dot(this.eye)) <
            PLANE_HIDE_THRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === TransformAxis.YZ) {
          if (
            Math.abs(_alignVector.copy(_unit[TransformAxis.X]).applyQuaternion(quaternion).dot(this.eye)) <
            PLANE_HIDE_THRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === TransformAxis.XZ) {
          if (
            Math.abs(_alignVector.copy(_unit[TransformAxis.Y]).applyQuaternion(quaternion).dot(this.eye)) <
            PLANE_HIDE_THRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }
      } else if (this.mode === TransformMode.rotate) {
        // Align handles to current local or world rotation

        _tempQuaternion2.copy(quaternion)
        _alignVector.copy(this.eye).applyQuaternion(_tempQuaternion.copy(quaternion).invert())

        if (handle.name.search(TransformAxis.E) !== -1) {
          handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(this.eye, V_000, _unit[TransformAxis.Y]))
        }

        if (handle.name === TransformAxis.X) {
          _tempQuaternion.setFromAxisAngle(_unit[TransformAxis.X], Math.atan2(-_alignVector.y, _alignVector.z))
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
          handle.quaternion.copy(_tempQuaternion)
        }

        if (handle.name === TransformAxis.Y) {
          _tempQuaternion.setFromAxisAngle(_unit[TransformAxis.Y], Math.atan2(_alignVector.x, _alignVector.z))
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
          handle.quaternion.copy(_tempQuaternion)
        }

        if (handle.name === TransformAxis.Z) {
          _tempQuaternion.setFromAxisAngle(_unit[TransformAxis.Z], Math.atan2(_alignVector.y, _alignVector.x))
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
          handle.quaternion.copy(_tempQuaternion)
        }
      }

      // Hide disabled axes
      handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.X) === -1 || this.showX)
      handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Y) === -1 || this.showY)
      handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Z) === -1 || this.showZ)
      handle.visible =
        handle.visible && (handle.name.indexOf(TransformAxis.E) === -1 || (this.showX && this.showY && this.showZ))

      // highlight selected axis

      handle.material._color = handle.material._color || handle.material.color.clone()
      handle.material._opacity = handle.material._opacity || handle.material.opacity

      handle.material.color.copy(handle.material._color)
      handle.material.opacity = handle.material._opacity

      if (this.enabled && this.axis) {
        if (handle.name === this.axis) {
          handle.material.color.setHex(0xffff00)
          handle.material.opacity = 1.0
        } else if (
          this.axis.split('').some(function (a) {
            return handle.name === a
          })
        ) {
          handle.material.color.setHex(0xffff00)
          handle.material.opacity = 1.0
        }
      }
    }

    super.updateMatrixWorld(force)
  }
}

class TransformControlsPlane extends Mesh {
  [x: string]: any
  isTransformControlsPlane: boolean
  type: any

  constructor() {
    super(
      new PlaneGeometry(100000, 100000, 2, 2),
      new MeshBasicMaterial({
        visible: false,
        wireframe: true,
        side: DoubleSide,
        transparent: true,
        opacity: 0.1,
        toneMapped: false
      })
    )

    this.isTransformControlsPlane = true

    this.type = 'TransformControlsPlane'
    this.name = 'TransformControlsPlane'
  }

  updateMatrixWorld(force) {
    let space = this.space

    this.position.copy(this.worldPosition)

    if (this.mode === TransformMode.scale) space = TransformSpace.local // scale always oriented to local rotation

    _v1.copy(_unit[TransformAxis.X]).applyQuaternion(space === TransformSpace.local ? this.worldQuaternion : Q_IDENTITY)
    _v2.copy(_unit[TransformAxis.Y]).applyQuaternion(space === TransformSpace.local ? this.worldQuaternion : Q_IDENTITY)
    _v3.copy(_unit[TransformAxis.Z]).applyQuaternion(space === TransformSpace.local ? this.worldQuaternion : Q_IDENTITY)

    // Align the plane for current transform mode, axis and space.

    _alignVector.copy(_v2)

    switch (this.mode) {
      case TransformMode.translate:
      case TransformMode.scale:
        switch (this.axis) {
          case TransformAxis.X:
            _alignVector.copy(this.eye).cross(_v1)
            _dirVector.copy(_v1).cross(_alignVector)
            break
          case TransformAxis.Y:
            _alignVector.copy(this.eye).cross(_v2)
            _dirVector.copy(_v2).cross(_alignVector)
            break
          case TransformAxis.Z:
            _alignVector.copy(this.eye).cross(_v3)
            _dirVector.copy(_v3).cross(_alignVector)
            break
          case TransformAxis.XY:
            _dirVector.copy(_v3)
            break
          case TransformAxis.YZ:
            _dirVector.copy(_v1)
            break
          case TransformAxis.XZ:
            _alignVector.copy(_v3)
            _dirVector.copy(_v2)
            break
          case TransformAxis.XYZ:
          case TransformAxis.E:
            _dirVector.set(0, 0, 0)
            break
        }

        break
      case TransformMode.rotate:
      default:
        // special case for rotate
        _dirVector.set(0, 0, 0)
    }

    if (_dirVector.length() === 0) {
      // If in rotate mode, make the plane parallel to camera
      this.quaternion.copy(this.cameraQuaternion)
    } else {
      _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector)

      this.quaternion.setFromRotationMatrix(_tempMatrix)
    }

    super.updateMatrixWorld(force)
  }
}

export { TransformControls, TransformControlsGizmo, TransformControlsPlane }
