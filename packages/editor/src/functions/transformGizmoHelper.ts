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

import { Color, Euler, Matrix4, MeshBasicMaterial, Object3D, Quaternion, Raycaster, Vector3 } from 'three'

import {
  ComponentType,
  Engine,
  Entity,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import {
  TransformAxis,
  TransformAxisType,
  TransformMode,
  TransformSpace,
  TransformSpaceType
} from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getState, NO_PROXY, State } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { Axis, Q_IDENTITY, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { TransformGizmoVisualComponent } from '../classes/gizmo/transform/TransformGizmoVisualComponent'
import { GizmoMaterial, gizmoMaterialProperties } from '../constants/GizmoPresets'
import { ObjectGridSnapState } from '../systems/ObjectGridSnapSystem'
import { EditorControlFunctions } from './EditorControlFunctions'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.TransformGizmo)
_raycaster.firstHitOnly = true

const _tempQuaternion = new Quaternion()
const _tempVector = new Vector3()
const _tempVector2 = new Vector3()

const _offset = new Vector3()
const _startNorm = new Vector3()
const _endNorm = new Vector3()

const _positionStart = new Vector3()
const _positionMultiStart: Record<Entity, Vector3> = {}
const _quaternionStart = new Quaternion()
const _quaternionMultiStart: Record<Entity, Quaternion> = {}
const _scaleStart = new Vector3()
const _scaleMultiStart: Record<Entity, Vector3> = []

const _worldPosition = new Vector3()
const _worldQuaternion = new Quaternion()
const _worldQuaternionInv = new Quaternion()
const _worldScale = new Vector3()

const _parentQuaternionInv = new Quaternion()
const _parentScale = new Vector3()

const _tempEuler = new Euler()
const _alignVector = new Vector3(0, 1, 0)
const _lookAtMatrix = new Matrix4()
const _dirVector = new Vector3()
const _tempMatrix = new Matrix4()

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

export function gizmoUpdate(gizmoControlEntity) {
  const gizmoControl = getComponent(gizmoControlEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return
  const mode = gizmoControl.mode

  const space =
    mode === TransformMode.scale && gizmoControl.controlledEntities.length === 1
      ? TransformSpace.local
      : gizmoControl.space // scale always oriented to local rotation

  const quaternion = space === TransformSpace.local ? gizmoControl.worldQuaternion : Q_IDENTITY

  const gizmo = getComponent(gizmoControl.visualEntity, TransformGizmoVisualComponent)
  if (gizmo === undefined) return

  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)

  const factor = (camera as any).isOrthographicCamera
    ? ((camera as any).top - (camera as any).bottom) / camera.zoom
    : gizmoControl.worldPosition.distanceTo(camera.position) *
      Math.min((1.9 * Math.tan((Math.PI * camera.fov) / 360)) / camera.zoom, 7)

  if (gizmo.gizmo === UndefinedEntity) return

  setComponent(gizmo.gizmo, TransformComponent, { position: gizmoControl.worldPosition })
  setComponent(gizmo.picker, TransformComponent, { position: gizmoControl.worldPosition })
  setComponent(gizmo.helper, TransformComponent, { position: Vector3_Zero })

  for (const helperEntity of getComponent(gizmo.helper, EntityTreeComponent).children) {
    removeComponent(helperEntity, VisibleComponent)
    const transform = getComponent(helperEntity, TransformComponent)
    transform.rotation.identity()
    transform.scale.set(1, 1, 1).multiplyScalar((factor * gizmoControl.size) / 4)
    transform.position.set(0, 0, 0)
    const name = getComponent(helperEntity, NameComponent)

    if (name === 'AXIS') {
      if (gizmoControl.axis) setComponent(helperEntity, VisibleComponent)
      transform.position.copy(gizmoControl.worldPosition)

      if (gizmoControl.axis === TransformAxis.X) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0))
        transform.rotation.copy(quaternion).multiply(_tempQuaternion)

        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.X]).applyQuaternion(quaternion).dot(gizmoControl.eye)) > 0.9
        ) {
          removeComponent(helperEntity, VisibleComponent)
        }
      }

      if (gizmoControl.axis === TransformAxis.Y) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2))
        transform.rotation.copy(quaternion).multiply(_tempQuaternion)

        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Y]).applyQuaternion(quaternion).dot(gizmoControl.eye)) > 0.9
        ) {
          removeComponent(helperEntity, VisibleComponent)
        }
      }

      if (gizmoControl.axis === TransformAxis.Z) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
        transform.rotation.copy(quaternion).multiply(_tempQuaternion)

        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Z]).applyQuaternion(quaternion).dot(gizmoControl.eye)) > 0.9
        ) {
          removeComponent(helperEntity, VisibleComponent)
        }
      }

      if (gizmoControl.axis === TransformAxis.XYZE) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
        _alignVector.copy(gizmoControl.rotationAxis)
        transform.rotation.setFromRotationMatrix(
          _lookAtMatrix.lookAt(Vector3_Zero, _alignVector, Axis[TransformAxis.Y])
        )
        transform.rotation.multiply(_tempQuaternion)
        if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
      }

      if (gizmoControl.axis === TransformAxis.E) {
        removeComponent(helperEntity, VisibleComponent)
      }
    } else if (name === 'START') {
      transform.position.copy(gizmoControl.worldPositionStart)
      if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
    } else if (name === 'END') {
      transform.position.copy(gizmoControl.worldPosition)
      if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
    } else if (name === 'DELTA') {
      transform.position.copy(gizmoControl.worldPositionStart)
      transform.rotation.copy(gizmoControl.worldQuaternionStart)
      _tempVector
        .set(1e-10, 1e-10, 1e-10)
        .add(gizmoControl.worldPositionStart)
        .sub(gizmoControl.worldPosition)
        .multiplyScalar(-1)
      _tempVector.applyQuaternion(gizmoControl.worldQuaternionStart.clone().invert())
      transform.scale.copy(_tempVector)
      if (gizmoControl.dragging) setComponent(helperEntity, VisibleComponent)
    } else {
      transform.rotation.copy(quaternion)

      if (gizmoControl.dragging) {
        transform.position.copy(gizmoControl.worldPositionStart)
      } else {
        transform.position.copy(gizmoControl.worldPosition)
      }

      if (gizmoControl.axis) {
        if (gizmoControl.axis.search(name) !== -1) setComponent(helperEntity, VisibleComponent)
      }
    }
  }

  const handles = [
    ...getComponent(gizmo.picker, EntityTreeComponent).children,
    ...getComponent(gizmo.gizmo, EntityTreeComponent).children
  ]

  for (const handleEntity of handles) {
    setComponent(handleEntity, VisibleComponent)
    const name = getComponent(handleEntity, NameComponent)
    const transform = getComponent(handleEntity, TransformComponent)
    transform.rotation.identity()
    transform.position.set(0, 0, 0)
    transform.scale.set(1, 1, 1).multiplyScalar((factor * gizmoControl.size) / 4)

    // Align handles to current local or world rotation

    transform.rotation.copy(quaternion)

    if (gizmoControl.mode === TransformMode.translate || gizmoControl.mode === TransformMode.scale) {
      // Hide translate and scale axis facing the camera

      const AXIS_HIDE_THRESHOLD = 0.99
      const PLANE_HIDE_THRESHOLD = 0.2

      if (name === TransformAxis.X) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.X]).applyQuaternion(quaternion).dot(gizmoControl.eye)) >
          AXIS_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.Y) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Y]).applyQuaternion(quaternion).dot(gizmoControl.eye)) >
          AXIS_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.Z) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Z]).applyQuaternion(quaternion).dot(gizmoControl.eye)) >
          AXIS_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.XY) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Z]).applyQuaternion(quaternion).dot(gizmoControl.eye)) <
          PLANE_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.YZ) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.X]).applyQuaternion(quaternion).dot(gizmoControl.eye)) <
          PLANE_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }

      if (name === TransformAxis.XZ) {
        if (
          Math.abs(_alignVector.copy(Axis[TransformAxis.Y]).applyQuaternion(quaternion).dot(gizmoControl.eye)) <
          PLANE_HIDE_THRESHOLD
        ) {
          transform.scale.set(1e-10, 1e-10, 1e-10)
          removeComponent(handleEntity, VisibleComponent)
        }
      }
    } else if (gizmoControl.mode === TransformMode.rotate) {
      // Align handles to current local or world rotation

      _alignVector.copy(gizmoControl.eye).applyQuaternion(_tempQuaternion.copy(quaternion).invert())

      if (name.search(TransformAxis.E) !== -1) {
        transform.rotation.setFromRotationMatrix(
          _lookAtMatrix.lookAt(gizmoControl.eye, Vector3_Zero, Axis[TransformAxis.Y])
        )
      }

      if (name === TransformAxis.X) {
        _tempQuaternion.setFromAxisAngle(Axis[TransformAxis.X], Math.atan2(-_alignVector.y, _alignVector.z))
        _tempQuaternion.multiplyQuaternions(quaternion.clone(), _tempQuaternion)
        transform.rotation.copy(_tempQuaternion)
      }

      if (name === TransformAxis.Y) {
        _tempQuaternion.setFromAxisAngle(Axis[TransformAxis.Y], Math.atan2(_alignVector.x, _alignVector.z))
        _tempQuaternion.multiplyQuaternions(quaternion.clone(), _tempQuaternion)
        transform.rotation.copy(_tempQuaternion)
      }

      if (name === TransformAxis.Z) {
        _tempQuaternion.setFromAxisAngle(Axis[TransformAxis.Z], Math.atan2(_alignVector.y, _alignVector.x))
        _tempQuaternion.multiplyQuaternions(quaternion.clone(), _tempQuaternion)
        transform.rotation.copy(_tempQuaternion)
      }
    }
    // Hide disabled axes

    const visible =
      (name.indexOf(TransformAxis.X) > -1 && gizmoControl.showX) ||
      (name.indexOf(TransformAxis.Y) > -1 && gizmoControl.showY) ||
      (name.indexOf(TransformAxis.Z) > -1 && gizmoControl.showZ) ||
      (name.indexOf(TransformAxis.E) > -1 && gizmoControl.showX && gizmoControl.showY && gizmoControl.showZ)

    if (visible) {
      setComponent(handleEntity, VisibleComponent)
    } else {
      removeComponent(handleEntity, VisibleComponent)
    }

    // highlight selected axis

    const material = getComponent(handleEntity, MeshComponent).material as MeshBasicMaterial & {
      _color: Color
      _opacity: number
    }

    //material._color = material._color ?? material.uniforms.color.value
    material._color = material._color ?? material.color.clone()
    material._opacity = material._opacity ?? material.opacity

    //setGizmogizmoMaterialProperties(material , material._color , material._opacity, true)

    material.color.copy(material._color)
    material.opacity = material._opacity

    if (gizmoControl.enabled && gizmoControl.axis) {
      if (gizmoControl.axis.includes(name)) {
        //setGizmoMaterial(handle, GizmoMaterial.YELLOW)
        material.color.set(gizmoMaterialProperties[GizmoMaterial.YELLOW].color)
        material.opacity = gizmoMaterialProperties[GizmoMaterial.YELLOW].opacity
      }
    }
  }
}

export function planeUpdate(gizmoEntity) {
  // update plane entity

  const gizmoControl = getOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  let space = gizmoControl.space

  const planeTransform = setComponent(gizmoControl.planeEntity, TransformComponent, {
    position: gizmoControl.worldPosition
  })

  if (gizmoControl.mode === TransformMode.scale) space = TransformSpace.local // scale always oriented to local rotation

  _v1
    .copy(Axis[TransformAxis.X])
    .applyQuaternion(space === TransformSpace.local ? gizmoControl.worldQuaternion : Q_IDENTITY)
  _v2
    .copy(Axis[TransformAxis.Y])
    .applyQuaternion(space === TransformSpace.local ? gizmoControl.worldQuaternion : Q_IDENTITY)
  _v3
    .copy(Axis[TransformAxis.Z])
    .applyQuaternion(space === TransformSpace.local ? gizmoControl.worldQuaternion : Q_IDENTITY)

  // Align the plane for current transform mode, axis and space.

  _alignVector.copy(_v2)

  switch (gizmoControl.mode) {
    case TransformMode.translate:
    case TransformMode.scale:
      switch (gizmoControl.axis) {
        case TransformAxis.X:
          _alignVector.copy(gizmoControl.eye).cross(_v1)
          _dirVector.copy(_v1).cross(_alignVector)
          break
        case TransformAxis.Y:
          _alignVector.copy(gizmoControl.eye).cross(_v2)
          _dirVector.copy(_v2).cross(_alignVector)
          break
        case TransformAxis.Z:
          _alignVector.copy(gizmoControl.eye).cross(_v3)
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
    const camera = getComponent(getState(EngineState).viewerEntity, TransformComponent)
    planeTransform.rotation.copy(camera.rotation)
  } else {
    _tempMatrix.lookAt(Vector3_Zero, _dirVector, _alignVector)
    planeTransform.rotation.setFromRotationMatrix(_tempMatrix)
  }
}

export function controlUpdate(gizmoEntity: Entity) {
  const gizmoControl = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl.controlledEntities.value.length > 1 && gizmoControl.pivotEntity.value === UndefinedEntity) return // need pivot Entity if more than one entity is controlled
  const targetEntity =
    gizmoControl.controlledEntities.value.length > 1
      ? gizmoControl.pivotEntity.value
      : gizmoControl.controlledEntities.get(NO_PROXY)[0]
  if (targetEntity === UndefinedEntity) return

  let parentEntity = UndefinedEntity
  const parent = getComponent(targetEntity, EntityTreeComponent)

  if (parent && parent.parentEntity !== UndefinedEntity) {
    parentEntity = parent.parentEntity!
  }

  if (parentEntity) _parentScale.copy(getComponent(parentEntity!, TransformComponent).scale)
  else _parentScale.set(1, 1, 1)

  const currentMatrix = getComponent(targetEntity, TransformComponent).matrixWorld
  currentMatrix.decompose(_worldPosition, _worldQuaternion, _worldScale)
  gizmoControl.worldPosition.set(_worldPosition)
  gizmoControl.worldQuaternion.set(_worldQuaternion)

  if (parentEntity) _parentQuaternionInv.copy(getComponent(parentEntity!, TransformComponent).rotation).invert()
  else _parentQuaternionInv.set(0, 0, 0, 1).invert()
  _worldQuaternionInv.copy(getComponent(targetEntity, TransformComponent).rotation).invert()

  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  if ((camera as any).isOrthographicCamera) {
    camera.getWorldDirection(gizmoControl.eye.value).negate()
  } else {
    gizmoControl.eye.value.subVectors(camera.position, gizmoControl.worldPosition.value).normalize()
  }
}

function pointerHover(gizmoEntity: Entity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointerPosition = getComponent(inputPointerEntity, InputPointerComponent).position
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const gizmoVisual = getComponent(gizmoControlComponent.visualEntity.value, TransformGizmoVisualComponent)
  const targetEntity =
    gizmoControlComponent.controlledEntities.value.length > 1
      ? gizmoControlComponent.pivotEntity.value
      : gizmoControlComponent.controlledEntities.get(NO_PROXY)[0]

  if (targetEntity === UndefinedEntity || gizmoControlComponent.dragging.value === true) return

  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointerPosition, camera)
  const picker = getComponent(gizmoVisual.picker, ObjectComponent)
  const intersect = intersectObjectWithRay(picker, _raycaster, true)

  if (intersect) {
    gizmoControlComponent.axis.set(intersect.object.name as (typeof TransformAxis)[keyof typeof TransformAxis])
  } else {
    gizmoControlComponent.axis.set(null)
  }
}

function pointerDown(gizmoEntity: Entity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointer = getComponent(inputPointerEntity, InputPointerComponent)
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const plane = getComponent(gizmoControlComponent.planeEntity.value, ObjectComponent)
  const targetEntity =
    gizmoControlComponent.controlledEntities.value.length > 1
      ? gizmoControlComponent.pivotEntity.value
      : gizmoControlComponent.controlledEntities.get(NO_PROXY)[0]

  if (
    targetEntity === UndefinedEntity ||
    gizmoControlComponent.dragging.value === true ||
    pointer.movement.length() !== 0
  )
    return

  if (gizmoControlComponent.axis.value !== null) {
    const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
    _raycaster.setFromCamera(pointer.position, camera)

    const planeIntersect = intersectObjectWithRay(plane, _raycaster, true)
    if (planeIntersect) {
      const currenttransform = getComponent(targetEntity, TransformComponent)
      _positionStart.copy(currenttransform.position)
      _quaternionStart.copy(currenttransform.rotation)
      _scaleStart.copy(currenttransform.scale)
      gizmoControlComponent.worldPositionStart.set(_positionStart)
      gizmoControlComponent.worldQuaternionStart.set(_quaternionStart)

      gizmoControlComponent.pointStart.set(planeIntersect.point.sub(_positionStart))

      if (
        gizmoControlComponent.controlledEntities.value.length > 1 &&
        gizmoControlComponent.pivotEntity.value !== UndefinedEntity
      ) {
        for (const cEntity of gizmoControlComponent.controlledEntities.value) {
          const currenttransform = getComponent(cEntity, TransformComponent)
          const _cMultiStart = new Vector3()
          const _cQuaternionStart = new Quaternion()
          const _cScaleStart = new Vector3()
          currenttransform.matrix.decompose(_cMultiStart, _cQuaternionStart, _cScaleStart)
          _positionMultiStart[cEntity] = _cMultiStart
          _quaternionMultiStart[cEntity] = _cQuaternionStart
          _scaleMultiStart[cEntity] = _cScaleStart
        }
      }
    }

    gizmoControlComponent.dragging.set(true)
  }
}

function applyTranslate(
  entity: Entity,
  pointStart: Vector3,
  pointEnd: Vector3,
  axis: TransformAxisType,
  space: TransformSpaceType,
  translationSnap: number | null,
  pivotControlledEntity = false
) {
  _offset.copy(pointEnd).sub(pointStart)

  if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
    _offset.applyQuaternion(_worldQuaternionInv)
  }
  if (axis.indexOf(TransformAxis.X) === -1) _offset.x = 0
  if (axis.indexOf(TransformAxis.Y) === -1) _offset.y = 0
  if (axis.indexOf(TransformAxis.Z) === -1) _offset.z = 0
  _offset
    .applyQuaternion(
      space === TransformSpace.local && axis !== TransformAxis.XYZ ? _quaternionStart : _parentQuaternionInv
    )
    .divide(_parentScale)
  const newPosition = getComponent(entity, TransformComponent).position
  newPosition.copy(_offset.add(pivotControlledEntity ? _positionMultiStart[entity] : _positionStart))
  // Apply translation snap
  if (translationSnap) {
    if (space === TransformSpace.local) {
      newPosition.applyQuaternion(_tempQuaternion.copy(_quaternionStart).invert())

      if (axis.search(TransformAxis.X) !== -1) {
        newPosition.x = Math.round(newPosition.x / translationSnap) * translationSnap
      }

      if (axis.search(TransformAxis.Y) !== -1) {
        newPosition.y = Math.round(newPosition.y / translationSnap) * translationSnap
      }

      if (axis.search(TransformAxis.Z) !== -1) {
        newPosition.z = Math.round(newPosition.z / translationSnap) * translationSnap
      }

      newPosition.applyQuaternion(_quaternionStart)
    }

    if (space === TransformSpace.world) {
      const parent = getComponent(entity, EntityTreeComponent)
      if (parent && parent.parentEntity !== UndefinedEntity) {
        newPosition.add(getComponent(parent.parentEntity!, TransformComponent).position)
      }

      if (axis.search(TransformAxis.X) !== -1) {
        newPosition.x = Math.round(newPosition.x / translationSnap) * translationSnap
      }

      if (axis.search(TransformAxis.Y) !== -1) {
        newPosition.y = Math.round(newPosition.y / translationSnap) * translationSnap
      }

      if (axis.search(TransformAxis.Z) !== -1) {
        newPosition.z = Math.round(newPosition.z / translationSnap) * translationSnap
      }

      if (parent && parent.parentEntity !== UndefinedEntity) {
        newPosition.sub(getComponent(parent.parentEntity!, TransformComponent).position)
      }
    }
  }
  return newPosition
}

function applyScale(
  entity: Entity,
  pointStart: Vector3,
  pointEnd: Vector3,
  axis: TransformAxisType,
  scaleSnap: number | null,
  pivotControlledEntity = false
) {
  if (axis.search(TransformAxis.XYZ) !== -1) {
    let d = pointEnd.length() / pointStart.length()

    if (pointEnd.dot(pointStart) < 0) d *= -1

    _tempVector2.set(d, d, d)
  } else {
    _tempVector.copy(pointStart)
    _tempVector2.copy(pointEnd)

    _tempVector.applyQuaternion(_worldQuaternionInv)
    _tempVector2.applyQuaternion(_worldQuaternionInv)

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
  newScale.copy(pivotControlledEntity ? _scaleMultiStart[entity] : _scaleStart).multiply(_tempVector2)

  if (scaleSnap) {
    if (axis.search(TransformAxis.X) !== -1) {
      newScale.x = Math.round(newScale.x / scaleSnap) * scaleSnap || scaleSnap
    }

    if (axis.search(TransformAxis.Y) !== -1) {
      newScale.y = Math.round(newScale.y / scaleSnap) * scaleSnap || scaleSnap
    }

    if (axis.search(TransformAxis.Z) !== -1) {
      newScale.z = Math.round(newScale.z / scaleSnap) * scaleSnap || scaleSnap
    }
  }

  return newScale
}

function applyRotation(
  entity: Entity,
  gizmoControlComponent: State<ComponentType<typeof TransformGizmoControlComponent>>,
  axis: TransformAxisType,
  space: TransformSpaceType
) {
  _offset.copy(gizmoControlComponent.pointEnd.value).sub(gizmoControlComponent.pointStart.value)
  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)

  const ROTATION_SPEED =
    20 / gizmoControlComponent.worldPosition.value.distanceTo(_tempVector.setFromMatrixPosition(camera.matrixWorld))

  let _inPlaneRotation = false

  if (axis === TransformAxis.XYZE) {
    gizmoControlComponent.rotationAxis.set(_offset.cross(gizmoControlComponent.eye.value).normalize())
    gizmoControlComponent.rotationAngle.set(
      _offset.dot(_tempVector.copy(gizmoControlComponent.rotationAxis.value).cross(gizmoControlComponent.eye.value)) *
        ROTATION_SPEED
    )
  } else if (axis === TransformAxis.X || axis === TransformAxis.Y || axis === TransformAxis.Z) {
    gizmoControlComponent.rotationAxis.set(Axis[axis])

    _tempVector.copy(Axis[axis])

    if (space === TransformSpace.local) {
      _tempVector.applyQuaternion(gizmoControlComponent.worldQuaternion.value)
    }

    _tempVector.cross(gizmoControlComponent.eye.value)

    // When _tempVector is 0 after cross with this.eye the vectors are parallel and should use in-plane rotation logic.
    if (_tempVector.length() === 0) {
      _inPlaneRotation = true
    } else {
      gizmoControlComponent.rotationAngle.set(_offset.dot(_tempVector.normalize()) * ROTATION_SPEED)
    }
  }

  if (axis === TransformAxis.E || _inPlaneRotation) {
    gizmoControlComponent.rotationAxis.set(gizmoControlComponent.eye.value)
    gizmoControlComponent.rotationAngle.set(
      gizmoControlComponent.pointEnd.value.angleTo(gizmoControlComponent.pointStart.value)
    )

    _startNorm.copy(gizmoControlComponent.pointStart.value).normalize()
    _endNorm.copy(gizmoControlComponent.pointEnd.value).normalize()

    gizmoControlComponent.rotationAngle.set(
      gizmoControlComponent.rotationAngle.value *
        (_endNorm.cross(_startNorm).dot(gizmoControlComponent.eye.value) < 0 ? 1 : -1)
    )
  }

  // Apply rotation snap

  if (gizmoControlComponent.rotationSnap.value)
    gizmoControlComponent.rotationAngle.set(
      Math.round(gizmoControlComponent.rotationAngle.value / gizmoControlComponent.rotationSnap.value) *
        gizmoControlComponent.rotationSnap.value
    )
  const newRotation = getComponent(entity, TransformComponent).rotation
  // Apply rotate
  if (space === TransformSpace.local && axis !== TransformAxis.E && axis !== TransformAxis.XYZE) {
    newRotation.copy(gizmoControlComponent.worldQuaternionStart.value)
    newRotation
      .multiply(
        _tempQuaternion.setFromAxisAngle(
          gizmoControlComponent.rotationAxis.value,
          gizmoControlComponent.rotationAngle.value
        )
      )
      .normalize()
  } else {
    const rotAxis = new Vector3().copy(gizmoControlComponent.rotationAxis.value)
    rotAxis.applyQuaternion(_parentQuaternionInv)
    gizmoControlComponent.rotationAxis.set(rotAxis)
    newRotation.copy(
      _tempQuaternion.setFromAxisAngle(
        gizmoControlComponent.rotationAxis.value,
        gizmoControlComponent.rotationAngle.value
      )
    )
    newRotation.multiply(gizmoControlComponent.worldQuaternionStart.value).normalize()
  }

  return newRotation
}

function applyPivotRotation(entity, pivotToOriginMatrix, originToPivotMatrix, rotationMatrix) {
  _tempMatrix.compose(_positionMultiStart[entity], _quaternionMultiStart[entity], _scaleMultiStart[entity])
  _tempMatrix
    .premultiply(pivotToOriginMatrix)
    .premultiply(rotationMatrix)
    .premultiply(originToPivotMatrix)
    .decompose(_tempVector, _tempQuaternion, _tempVector2)
  return { newPosition: _tempVector, newRotation: _tempQuaternion, newScale: _tempVector2 }
}

function pointerMove(gizmoEntity: Entity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointer = getComponent(inputPointerEntity, InputPointerComponent)
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const targetEntity =
    gizmoControlComponent.controlledEntities.value.length > 1
      ? gizmoControlComponent.pivotEntity.value
      : gizmoControlComponent.controlledEntities.get(NO_PROXY)[0]

  const axis = gizmoControlComponent.axis.value
  const mode = gizmoControlComponent.mode.value
  const plane = getComponent(gizmoControlComponent.planeEntity.value, ObjectComponent)

  let space = gizmoControlComponent.space.value

  if (mode === TransformMode.scale) {
    space = TransformSpace.local
  } else if (axis === TransformAxis.E || axis === TransformAxis.XYZE || axis === TransformAxis.XYZ) {
    space = TransformSpace.world
  }

  if (
    targetEntity === UndefinedEntity ||
    axis === null ||
    gizmoControlComponent.dragging.value === false ||
    pointer.movement.length() === 0
  )
    return

  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointer.position, camera)

  const planeIntersect = intersectObjectWithRay(plane, _raycaster, true)

  if (!planeIntersect) return
  gizmoControlComponent.pointEnd.set(planeIntersect.point.sub(gizmoControlComponent.worldPositionStart.value))

  if (mode === TransformMode.translate) {
    // Apply translate
    const newPosition = applyTranslate(
      targetEntity,
      gizmoControlComponent.pointStart.value,
      gizmoControlComponent.pointEnd.value,
      axis,
      space,
      gizmoControlComponent.translationSnap.value
    )
    EditorControlFunctions.positionObject([targetEntity], [newPosition])
    if (
      gizmoControlComponent.controlledEntities.value.length > 1 &&
      gizmoControlComponent.pivotEntity.value !== UndefinedEntity
    ) {
      for (const cEntity of gizmoControlComponent.controlledEntities.value) {
        const newPosition = applyTranslate(
          cEntity,
          gizmoControlComponent.pointStart.value,
          gizmoControlComponent.pointEnd.value,
          axis,
          space,
          gizmoControlComponent.translationSnap.value,
          true
        )
        EditorControlFunctions.positionObject([cEntity], [newPosition])
      }
    }
  } else if (mode === TransformMode.scale) {
    const newScale = applyScale(
      targetEntity,
      gizmoControlComponent.pointStart.value,
      gizmoControlComponent.pointEnd.value,
      axis,
      gizmoControlComponent.scaleSnap.value
    )
    EditorControlFunctions.scaleObject([targetEntity], [newScale], true)
    if (
      gizmoControlComponent.controlledEntities.value.length > 1 &&
      gizmoControlComponent.pivotEntity.value !== UndefinedEntity
    ) {
      for (const cEntity of gizmoControlComponent.controlledEntities.value) {
        const newScale = applyScale(
          cEntity,
          gizmoControlComponent.pointStart.value,
          gizmoControlComponent.pointEnd.value,
          axis,
          gizmoControlComponent.scaleSnap.value,
          true
        )
        const newPosition = getComponent(cEntity, TransformComponent).position
        const newDistance = _positionMultiStart[cEntity].clone().sub(_positionStart.clone()).multiply(_tempVector2)
        newPosition.copy(newDistance.add(_positionStart))
        EditorControlFunctions.scaleObject([cEntity], [newScale], true)
        EditorControlFunctions.positionObject([cEntity], [newPosition])
      }
    }
  } else if (mode === TransformMode.rotate) {
    const newRotation = applyRotation(targetEntity, gizmoControlComponent, axis, space)
    EditorControlFunctions.rotateObject([targetEntity], [newRotation])
    if (
      gizmoControlComponent.controlledEntities.value.length > 1 &&
      gizmoControlComponent.pivotEntity.value !== UndefinedEntity
    ) {
      const pivotToOriginMatrix = _tempMatrix
        .clone()
        .makeTranslation(-_positionStart.x, -_positionStart.y, -_positionStart.z)
      const originToPivotMatrix = _tempMatrix
        .clone()
        .makeTranslation(_positionStart.x, _positionStart.y, _positionStart.z)
      const rotationMatrix = _tempMatrix
        .clone()
        .makeRotationAxis(
          space === TransformSpace.local
            ? Axis[axis].clone().applyQuaternion(gizmoControlComponent.worldQuaternion.value)
            : gizmoControlComponent.rotationAxis.value,
          gizmoControlComponent.rotationAngle.value
        )
      for (const cEntity of gizmoControlComponent.controlledEntities.value) {
        const { newPosition, newRotation, newScale } = applyPivotRotation(
          cEntity,
          pivotToOriginMatrix,
          originToPivotMatrix,
          rotationMatrix
        )
        EditorControlFunctions.positionObject([cEntity], [newPosition])
        EditorControlFunctions.rotateObject([cEntity], [newRotation])
        EditorControlFunctions.scaleObject([cEntity], [newScale], true)
      }
    }
  }
}

export function onGizmoCommit(gizmoEntity) {
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControlComponent.dragging && gizmoControlComponent.axis !== null) {
    //check for snap modes
    if (!getState(ObjectGridSnapState).enabled) {
      EditorControlFunctions.commitTransformSave(gizmoControlComponent.controlledEntities.get(NO_PROXY) as Entity[])
    } else {
      ObjectGridSnapState.apply()
    }
  }
  gizmoControlComponent.dragging.set(false)
  gizmoControlComponent.axis.set(null)
}

function pointerUp(gizmoEntity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointer = getComponent(inputPointerEntity, InputPointerComponent)

  if (pointer.movement.length() !== 0) return
  onGizmoCommit(gizmoEntity)
}

export function onPointerHover(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return
  if (!gizmoControl.enabled) return

  pointerHover(gizmoEntity)
}

export function onPointerDown(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  pointerHover(gizmoEntity)
  pointerDown(gizmoEntity)
}

export function onPointerMove(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  pointerMove(gizmoEntity)
}

export function onPointerUp(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  pointerUp(gizmoEntity)
}

export function intersectObjectWithRay(object: Object3D, raycaster: Raycaster, includeInvisible?: boolean) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}

export function onPointerLost(gizmoEntity: Entity) {
  setComponent(gizmoEntity, TransformGizmoControlComponent, { dragging: false, axis: null })
}
