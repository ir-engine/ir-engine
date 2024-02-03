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

import {
  Engine,
  UndefinedEntity,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { TransformControlsPlane } from '@etherealengine/engine/src/scene/classes/TransformGizmo'
import {
  TransformAxis,
  TransformMode,
  TransformSpace
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { Q_IDENTITY, V_000, V_001, V_010, V_100 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { EngineRenderer } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import {
  GroupComponent,
  addObjectToGroup,
  removeObjectFromGroup
} from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Euler, Matrix4, Quaternion, Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/TransformGizmoControlComponent'
import { TransformGizmoVisualComponent } from '../classes/TransformGizmoVisualComponent'
import { ObjectGridSnapState } from '../systems/ObjectGridSnapSystem'
import { EditorControlFunctions } from './EditorControlFunctions'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.TransformGizmo)

const _tempQuaternion = new Quaternion()
const _tempVector = new Vector3()
const _tempVector2 = new Vector3()
const _unit = {
  X: V_100,
  Y: V_010,
  Z: V_001
}
const _offset = new Vector3()
const _startNorm = new Vector3()
const _endNorm = new Vector3()

const _positionStart = new Vector3()
const _quaternionStart = new Quaternion()
const _scaleStart = new Vector3()

const _worldQuaternionInv = new Quaternion()

const _worldPosition = new Vector3()
const _worldQuaternion = new Quaternion()
const _worldScale = new Vector3()

const _parentQuaternionInv = new Quaternion()
const _parentScale = new Vector3()

const _tempEuler = new Euler()
const _alignVector = new Vector3(0, 1, 0)
const _lookAtMatrix = new Matrix4()
const _tempQuaternion2 = new Quaternion()
const _dirVector = new Vector3()
const _tempMatrix = new Matrix4()
const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
const domElement = EngineRenderer.instance.renderer.domElement

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

export function initGizmo(gizmoEntity, plane) {
  const gizmoComponent = getComponent(gizmoEntity, TransformGizmoControlComponent)
  addObjectToGroup(gizmoComponent.planeEntity, plane) // adding object calls attach internally on the gizmo, so attch entity last
  setObjectLayers(plane, ObjectLayers.TransformGizmo)
}

export function destroyGizmo(gizmoEntity, plane) {
  const gizmoComponent = getComponent(gizmoEntity, TransformGizmoControlComponent)
  removeObjectFromGroup(gizmoComponent.planeEntity, plane) // adding object calls attach internally on the gizmo, so attch entity last
  removeEntity(gizmoComponent.visualEntity)
  removeEntity(gizmoComponent.planeEntity)
}

export function gizmoUpdate(gizmoEntity) {
  // break this up into multiple entities
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return
  const mode = gizmoControl.mode

  const space = mode === TransformMode.scale ? TransformSpace.local : gizmoControl.space // scale always oriented to local rotation

  const quaternion = space === TransformSpace.local ? gizmoControl.worldQuaternion : Q_IDENTITY

  // Show only gizmos for current transform mode
  const gizmo = getComponent(gizmoControl.visualEntity, TransformGizmoVisualComponent)
  //setComponent(gizmoControl.visualEntity, TransformComponent, { position: gizmoControl.worldPosition })
  const factor = (camera as any).isOrthographicCamera
    ? ((camera as any).top - (camera as any).bottom) / camera.zoom
    : gizmoControl.worldPosition.distanceTo(camera.position) *
      Math.min((1.9 * Math.tan((Math.PI * camera.fov) / 360)) / camera.zoom, 7)

  if (gizmo.gizmo[TransformMode.translate] === UndefinedEntity) return
  if (gizmo.gizmo[TransformMode.rotate] === UndefinedEntity) return
  if (gizmo.gizmo[TransformMode.scale] === UndefinedEntity) return

  setVisibleComponent(gizmo.gizmo[TransformMode.translate], gizmoControl.mode === TransformMode.translate)
  setVisibleComponent(gizmo.gizmo[TransformMode.rotate], gizmoControl.mode === TransformMode.rotate)
  setVisibleComponent(gizmo.gizmo[TransformMode.scale], gizmoControl.mode === TransformMode.scale)

  setVisibleComponent(gizmo.helper[TransformMode.translate], gizmoControl.mode === TransformMode.translate)
  setVisibleComponent(gizmo.helper[TransformMode.rotate], gizmoControl.mode === TransformMode.rotate)
  setVisibleComponent(gizmo.helper[TransformMode.scale], gizmoControl.mode === TransformMode.scale)

  const gizmoObject = getComponent(gizmo.gizmo[gizmoControl.mode], GroupComponent)[0]
  const pickerObject = getComponent(gizmo.picker[gizmoControl.mode], GroupComponent)[0]
  const helperObject = getComponent(gizmo.helper[gizmoControl.mode], GroupComponent)[0]

  gizmoObject.position.copy(gizmoControl.worldPosition)
  pickerObject.position.copy(gizmoControl.worldPosition)
  helperObject.position.set(0, 0, 0)

  let handles: any[] = []
  handles = handles.concat(getComponent(gizmo.picker[gizmoControl.mode], GroupComponent)[0].children)
  handles = handles.concat(getComponent(gizmo.gizmo[gizmoControl.mode], GroupComponent)[0].children)

  for (const handle of helperObject.children) {
    handle.visible = false
    handle.rotation.set(0, 0, 0)
    handle.scale.set(1, 1, 1).multiplyScalar((factor * gizmoControl.size) / 4)
    handle.position.set(0, 0, 0)

    if (handle.name === 'AXIS') {
      handle.visible = !!gizmoControl.axis
      handle.position.copy(gizmoControl.worldPosition)

      if (gizmoControl.axis === TransformAxis.X) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0))
        handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.X]).applyQuaternion(quaternion).dot(gizmoControl.eye)) > 0.9
        ) {
          handle.visible = false
        }
      }

      if (gizmoControl.axis === TransformAxis.Y) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2))
        handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.Y]).applyQuaternion(quaternion).dot(gizmoControl.eye)) > 0.9
        ) {
          handle.visible = false
        }
      }

      if (gizmoControl.axis === TransformAxis.Z) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
        handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.Z]).applyQuaternion(quaternion).dot(gizmoControl.eye)) > 0.9
        ) {
          handle.visible = false
        }
      }

      if (gizmoControl.axis === TransformAxis.XYZE) {
        _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
        _alignVector.copy(gizmoControl.rotationAxis)
        handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(V_000, _alignVector, _unit[TransformAxis.Y]))
        handle.quaternion.multiply(_tempQuaternion)
        handle.visible = gizmoControl.dragging
      }

      if (gizmoControl.axis === TransformAxis.E) {
        handle.visible = false
      }
    } else if (handle.name === 'START') {
      handle.position.copy(gizmoControl.worldPositionStart)
      handle.visible = gizmoControl.dragging
    } else if (handle.name === 'END') {
      handle.position.copy(gizmoControl.worldPosition)
      handle.visible = gizmoControl.dragging
    } else if (handle.name === 'DELTA') {
      handle.position.copy(gizmoControl.worldPositionStart)
      handle.quaternion.copy(gizmoControl.worldQuaternionStart)
      _tempVector
        .set(1e-10, 1e-10, 1e-10)
        .add(gizmoControl.worldPositionStart)
        .sub(gizmoControl.worldPosition)
        .multiplyScalar(-1)
      _tempVector.applyQuaternion(gizmoControl.worldQuaternionStart.clone().invert())
      handle.scale.copy(_tempVector)
      handle.visible = gizmoControl.dragging
    } else {
      handle.quaternion.copy(quaternion)

      if (gizmoControl.dragging) {
        handle.position.copy(gizmoControl.worldPositionStart)
      } else {
        handle.position.copy(gizmoControl.worldPosition)
      }

      if (gizmoControl.axis) {
        handle.visible = gizmoControl.axis.search(handle.name) !== -1
      }
    }
  }

  for (let i = 0; i < handles.length; i++) {
    const handle: any = handles[i]
    // hide aligned to camera

    handle.visible = true
    handle.rotation.set(0, 0, 0)
    handle.position.set(0, 0, 0)
    //handle.position.copy(gizmoControl.worldPosition)
    handle.scale.set(1, 1, 1).multiplyScalar((factor * gizmoControl.size) / 4)

    // TODO: simplify helpers and consider decoupling from gizmo

    if (handle.tag === 'helper') {
      handle.visible = false

      // If updating helper, skip rest of the loop
      continue
    }

    // Align handles to current local or world rotation

    handle.quaternion.copy(quaternion)

    if (gizmoControl.mode === TransformMode.translate || gizmoControl.mode === TransformMode.scale) {
      // Hide translate and scale axis facing the camera

      const AXIS_HIDE_THRESHOLD = 0.99
      const PLANE_HIDE_THRESHOLD = 0.2

      if (handle.name === TransformAxis.X) {
        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.X]).applyQuaternion(quaternion).dot(gizmoControl.eye)) >
          AXIS_HIDE_THRESHOLD
        ) {
          handle.scale.set(1e-10, 1e-10, 1e-10)
          handle.visible = false
        }
      }

      if (handle.name === TransformAxis.Y) {
        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.Y]).applyQuaternion(quaternion).dot(gizmoControl.eye)) >
          AXIS_HIDE_THRESHOLD
        ) {
          handle.scale.set(1e-10, 1e-10, 1e-10)
          handle.visible = false
        }
      }

      if (handle.name === TransformAxis.Z) {
        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.Z]).applyQuaternion(quaternion).dot(gizmoControl.eye)) >
          AXIS_HIDE_THRESHOLD
        ) {
          handle.scale.set(1e-10, 1e-10, 1e-10)
          handle.visible = false
        }
      }

      if (handle.name === TransformAxis.XY) {
        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.Z]).applyQuaternion(quaternion).dot(gizmoControl.eye)) <
          PLANE_HIDE_THRESHOLD
        ) {
          handle.scale.set(1e-10, 1e-10, 1e-10)
          handle.visible = false
        }
      }

      if (handle.name === TransformAxis.YZ) {
        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.X]).applyQuaternion(quaternion).dot(gizmoControl.eye)) <
          PLANE_HIDE_THRESHOLD
        ) {
          handle.scale.set(1e-10, 1e-10, 1e-10)
          handle.visible = false
        }
      }

      if (handle.name === TransformAxis.XZ) {
        if (
          Math.abs(_alignVector.copy(_unit[TransformAxis.Y]).applyQuaternion(quaternion).dot(gizmoControl.eye)) <
          PLANE_HIDE_THRESHOLD
        ) {
          handle.scale.set(1e-10, 1e-10, 1e-10)
          handle.visible = false
        }
      }
    } else if (gizmoControl.mode === TransformMode.rotate) {
      // Align handles to current local or world rotation

      _tempQuaternion2.copy(quaternion)
      _alignVector.copy(gizmoControl.eye).applyQuaternion(_tempQuaternion.copy(quaternion).invert())

      if (handle.name.search(TransformAxis.E) !== -1) {
        handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(gizmoControl.eye, V_000, _unit[TransformAxis.Y]))
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
    handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.X) === -1 || gizmoControl.showX)
    handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Y) === -1 || gizmoControl.showY)
    handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Z) === -1 || gizmoControl.showZ)
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.E) === -1 || (gizmoControl.showX && gizmoControl.showY && gizmoControl.showZ))

    // highlight selected axis

    handle.material._color = handle.material._color || handle.material.color.clone()
    handle.material._opacity = handle.material._opacity || handle.material.opacity

    handle.material.color.copy(handle.material._color)
    handle.material.opacity = handle.material._opacity

    if (gizmoControl.enabled && gizmoControl.axis) {
      if (handle.name === gizmoControl.axis) {
        handle.material.color.setHex(0xffff00)
        handle.material.opacity = 1.0
      } else if (
        gizmoControl.axis.split('').some(function (a) {
          return handle.name === a
        })
      ) {
        handle.material.color.setHex(0xffff00)
        handle.material.opacity = 1.0
      }
    }
  }
}

export function planeUpdate(gizmoEntity) {
  // update plane entity

  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return
  let space = gizmoControl.space

  setComponent(gizmoControl.planeEntity, TransformComponent, { position: gizmoControl.worldPosition })

  if (gizmoControl.mode === TransformMode.scale) space = TransformSpace.local // scale always oriented to local rotation

  _v1
    .copy(_unit[TransformAxis.X])
    .applyQuaternion(space === TransformSpace.local ? gizmoControl.worldQuaternion : Q_IDENTITY)
  _v2
    .copy(_unit[TransformAxis.Y])
    .applyQuaternion(space === TransformSpace.local ? gizmoControl.worldQuaternion : Q_IDENTITY)
  _v3
    .copy(_unit[TransformAxis.Z])
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
    setComponent(gizmoControl.planeEntity, TransformComponent, { rotation: camera.quaternion })
  } else {
    _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector)
    setComponent(gizmoControl.planeEntity, TransformComponent, {
      rotation: new Quaternion().setFromRotationMatrix(_tempMatrix)
    })
  }
}

export function controlUpdate(gizmoEntity) {
  const gizmoControl = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (gizmoControl.controlledEntity.value !== UndefinedEntity) {
    let parentEntity = SceneState.getRootEntity(getState(SceneState).activeScene!) // we can always ensure scene entity is root parent even if entty tree component doesnt exist
    const parent = getComponent(gizmoControl.controlledEntity.value, EntityTreeComponent)

    if (parent && parent.parentEntity !== UndefinedEntity) {
      parentEntity = parent.parentEntity!
    }

    _parentScale.copy(getComponent(parentEntity!, TransformComponent).scale)

    const currentMatrix = getComponent(gizmoControl.controlledEntity.value, TransformComponent).matrix
    currentMatrix.decompose(_worldPosition, _worldQuaternion, _worldScale)
    gizmoControl.worldPosition.set(_worldPosition)
    gizmoControl.worldQuaternion.set(_worldQuaternion)

    _parentQuaternionInv.copy(getComponent(parentEntity!, TransformComponent).rotation).invert()
    _worldQuaternionInv.copy(getComponent(gizmoControl.controlledEntity.value, TransformComponent).rotation).invert()
  }

  if ((camera as any).isOrthographicCamera) {
    camera.getWorldDirection(gizmoControl.eye.value).negate()
  } else {
    gizmoControl.eye.set(camera.position.clone().sub(gizmoControl.worldPosition.value).normalize())
  }
}

function pointerHover(pointer, gizmoEntity) {
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const gizmoVisual = getComponent(gizmoControlComponent.visualEntity.value, TransformGizmoVisualComponent)
  const picker = getComponent(gizmoVisual.picker[gizmoControlComponent.mode.value], GroupComponent)[0]

  if (gizmoControlComponent.controlledEntity.value === UndefinedEntity || gizmoControlComponent.dragging.value === true)
    return

  _raycaster.setFromCamera(pointer, camera)
  const intersect = intersectObjectWithRay(picker, _raycaster, true)

  if (intersect) {
    gizmoControlComponent.axis.set(intersect.object.name)
  } else {
    gizmoControlComponent.axis.set(null)
  }
}

function pointerDown(pointer, gizmoEntity) {
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)
  const plane = getComponent(gizmoControlComponent.planeEntity.value, GroupComponent)[0] as TransformControlsPlane
  if (
    gizmoControlComponent.controlledEntity.value === UndefinedEntity ||
    gizmoControlComponent.dragging.value === true ||
    pointer.button !== 0
  )
    return

  if (gizmoControlComponent.axis.value !== null) {
    _raycaster.setFromCamera(pointer, camera)

    const planeIntersect = intersectObjectWithRay(plane, _raycaster, true)
    if (planeIntersect) {
      const currenttransform = getComponent(gizmoControlComponent.controlledEntity.value, TransformComponent)
      currenttransform.matrix.decompose(_positionStart, _quaternionStart, _scaleStart)
      gizmoControlComponent.worldPositionStart.set(_positionStart)
      gizmoControlComponent.worldQuaternionStart.set(_quaternionStart)

      gizmoControlComponent.pointStart.set(planeIntersect.point.sub(_positionStart))
    }

    gizmoControlComponent.dragging.set(true)
    //;(_mouseDownEvent as any).mode = this.mode
    //this.dispatchEvent(_mouseDownEvent as any)
  }
}

function pointerMove(pointer, gizmoEntity) {
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)

  const axis = gizmoControlComponent.axis.value
  const mode = gizmoControlComponent.mode.value
  const entity = gizmoControlComponent.controlledEntity.value
  const plane = getComponent(gizmoControlComponent.planeEntity.value, GroupComponent)[0] as TransformControlsPlane

  let space = gizmoControlComponent.space.value

  if (mode === TransformMode.scale) {
    space = TransformSpace.local
  } else if (axis === TransformAxis.E || axis === TransformAxis.XYZE || axis === TransformAxis.XYZ) {
    space = TransformSpace.world
  }

  if (
    entity === UndefinedEntity ||
    axis === null ||
    gizmoControlComponent.dragging.value === false ||
    pointer.button !== -1
  )
    return

  _raycaster.setFromCamera(pointer, camera)

  const planeIntersect = intersectObjectWithRay(plane, _raycaster, true)

  if (!planeIntersect) return
  gizmoControlComponent.pointEnd.set(planeIntersect.point.sub(gizmoControlComponent.worldPositionStart.value))

  if (mode === TransformMode.translate) {
    // Apply translate
    const newPosition = getComponent(entity, TransformComponent).position
    _offset.copy(gizmoControlComponent.pointEnd.value).sub(gizmoControlComponent.pointStart.value)

    if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
      _offset.applyQuaternion(_worldQuaternionInv)
    }

    if (axis.indexOf(TransformAxis.X) === -1) _offset.x = 0
    if (axis.indexOf(TransformAxis.Y) === -1) _offset.y = 0
    if (axis.indexOf(TransformAxis.Z) === -1) _offset.z = 0

    if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
      _offset.applyQuaternion(_quaternionStart).divide(_parentScale)
    } else {
      _offset.applyQuaternion(_parentQuaternionInv).divide(_parentScale)
    }
    newPosition.copy(_offset.add(_positionStart))
    // Apply translation snap
    const translationSnap = gizmoControlComponent.translationSnap.value
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

    setComponent(entity, TransformComponent, { position: newPosition })
  } else if (mode === TransformMode.scale) {
    if (axis.search(TransformAxis.XYZ) !== -1) {
      let d = gizmoControlComponent.pointEnd.value.length() / gizmoControlComponent.pointStart.value.length()

      if (gizmoControlComponent.pointEnd.value.dot(gizmoControlComponent.pointStart.value) < 0) d *= -1

      _tempVector2.set(d, d, d)
    } else {
      _tempVector.copy(gizmoControlComponent.pointStart.value)
      _tempVector2.copy(gizmoControlComponent.pointEnd.value)

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
    newScale.copy(_scaleStart).multiply(_tempVector2)
    const scaleSnap = gizmoControlComponent.scaleSnap.value
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
    setComponent(entity, TransformComponent, { scale: newScale })
  } else if (mode === TransformMode.rotate) {
    console.log('rotate')
    _offset.copy(gizmoControlComponent.pointEnd.value).sub(gizmoControlComponent.pointStart.value)

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
      gizmoControlComponent.rotationAxis.set(_unit[axis])

      _tempVector.copy(_unit[axis])

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
        gizmoControlComponent.rotationAngle.value * _endNorm.cross(_startNorm).dot(gizmoControlComponent.eye.value) < 0
          ? 1
          : -1
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
      console.log(gizmoControlComponent.rotationAxis.value, gizmoControlComponent.rotationAngle.value)
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
    const euler = new Euler().setFromQuaternion(newRotation)

    setComponent(entity, TransformComponent, { rotation: newRotation })
  }

  //this.dispatchEvent(_changeEvent as any)
  //this.dispatchEvent(_objectChangeEvent as any)
}

function pointerUp(pointer, gizmoEntity) {
  const gizmoControlComponent = getMutableComponent(gizmoEntity, TransformGizmoControlComponent)

  if (pointer.button !== 0) return

  if (gizmoControlComponent.dragging && gizmoControlComponent.axis !== null) {
    //_mouseUpEvent.mode = gizmoControlComponent.mode
    //this.dispatchEvent(_mouseUpEvent as any)
    //check for snap modes
    if (!getState(ObjectGridSnapState).enabled) {
      EditorControlFunctions.commitTransformSave([gizmoControlComponent.controlledEntity.value])
    } else {
      getMutableState(ObjectGridSnapState).apply.set(true)
    }
  }
  // cannot call editor function here, better to keep thee event system
  gizmoControlComponent.dragging.set(false)
  gizmoControlComponent.axis.set(null)
}

function getPointer(event) {
  if (domElement.ownerDocument.pointerLockElement) {
    return {
      x: 0,
      y: 0,
      button: event.button
    }
  } else {
    const rect = domElement.getBoundingClientRect()

    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      button: event.button
    }
  }
}
//connected events
export function onPointerHover(event, gizmoEntity) {
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return
  if (!gizmoControl.enabled) return

  switch (event.pointerType) {
    case 'mouse':
    case 'pen':
      // eslint-disable-next-line no-case-declarations
      pointerHover(getPointer(event), gizmoEntity)
  }
}

export function onPointerDown(event, gizmoEntity) {
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  if (!document.pointerLockElement) {
    domElement.setPointerCapture(event.pointerId)
  }

  domElement.addEventListener('pointermove', (event) => {
    onPointerMove(event, gizmoEntity)
  })

  pointerHover(getPointer(event), gizmoEntity)
  pointerDown(getPointer(event), gizmoEntity)
}

export function onPointerMove(event, gizmoEntity) {
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  pointerMove(getPointer(event), gizmoEntity)
}

export function onPointerUp(event, gizmoEntity) {
  const gizmoControl = getComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  domElement.releasePointerCapture(event.pointerId)

  domElement.removeEventListener('pointermove', (event) => {
    onPointerMove(event, gizmoEntity)
  })

  pointerUp(getPointer(event), gizmoEntity)
}

export function intersectObjectWithRay(object, raycaster, includeInvisible?) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}
