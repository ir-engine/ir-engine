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

import { Euler, Matrix4, Quaternion, Raycaster, Vector3 } from 'three'

import {
  Engine,
  Entity,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { TransformAxis } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { CameraGizmoControlComponent } from '../classes/gizmo/camera/CameraGizmoControlComponent'
import { CameraGizmoVisualComponent } from '../classes/gizmo/camera/CameraGizmoVisualComponent'
import { GizmoMaterial, gizmoMaterialProperties } from '../constants/GizmoPresets'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.TransformGizmo)

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

export function gizmoUpdate(gizmoEntity) {
  const gizmoControl = getComponent(gizmoEntity, CameraGizmoControlComponent)
  if (gizmoControl === undefined) return

  const gizmo = getComponent(gizmoControl.visualEntity, CameraGizmoVisualComponent)
  if (gizmo === undefined) return

  if (gizmo.gizmo === UndefinedEntity) return

  let handles: any[] = []
  handles = handles.concat(getComponent(gizmo.picker, GroupComponent)[0].children)
  handles = handles.concat(getComponent(gizmo.gizmo, GroupComponent)[0].children)

  for (const handle of handles) {
    handle.visible = true
    handle.rotation.set(0, 0, 0)
    handle.position.set(0, 0, 0)

    // Hide disabled axes
    handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.X) === -1 || gizmoControl.showX)
    handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Y) === -1 || gizmoControl.showY)
    handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Z) === -1 || gizmoControl.showZ)
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.E) === -1 || (gizmoControl.showX && gizmoControl.showY && gizmoControl.showZ))

    // highlight selected axis

    //handle.material._color = handle.material._color || handle.material.uniforms.color.value
    handle.material._color = handle.material._color || handle.material.color.clone()
    handle.material._opacity = handle.material._opacity || handle.material.opacity

    //setGizmogizmoMaterialProperties(handle.material , handle.material._color , handle.material._opacity, true)

    handle.material.color.copy(handle.material._color)
    handle.material.opacity = handle.material._opacity

    if (gizmoControl.enabled && gizmoControl.axis) {
      if (handle.name === gizmoControl.axis) {
        //setGizmoMaterial(handle, GizmoMaterial.YELLOW)
        handle.material.color.set(gizmoMaterialProperties[GizmoMaterial.YELLOW].color)
        handle.material.opacity = gizmoMaterialProperties[GizmoMaterial.YELLOW].opacity
      } else if (
        gizmoControl.axis.split('').some(function (a) {
          return handle.name === a
        })
      ) {
        //setGizmoMaterial(handle, GizmoMaterial.YELLOW)
        handle.material.color.set(gizmoMaterialProperties[GizmoMaterial.YELLOW].color)
        handle.material.opacity = gizmoMaterialProperties[GizmoMaterial.YELLOW].opacity
      }
    }
  }
}

export function controlUpdate(gizmoEntity: Entity) {
  const gizmoControl = getMutableComponent(gizmoEntity, CameraGizmoControlComponent)
  if (gizmoControl === undefined) return
  const targetEntity = gizmoControl.controlledCameras.get(NO_PROXY)[0]
  if (targetEntity === UndefinedEntity) return

  let parentEntity = UndefinedEntity
  const parent = getComponent(targetEntity, EntityTreeComponent)

  if (parent && parent.parentEntity !== UndefinedEntity) {
    parentEntity = parent.parentEntity!
  }
}

function pointerHover(gizmoEntity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointerPosition = getComponent(inputPointerEntity, InputPointerComponent).position
  const gizmoControlComponent = getMutableComponent(gizmoEntity, CameraGizmoControlComponent)
  const gizmoVisual = getComponent(gizmoControlComponent.visualEntity.value, CameraGizmoVisualComponent)
  const picker = getComponent(gizmoVisual.picker, GroupComponent)[0]
  const targetEntity = gizmoControlComponent.controlledCameras.get(NO_PROXY)[0]

  if (targetEntity === UndefinedEntity) return

  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointerPosition, camera)
  const intersect = intersectObjectWithRay(picker, _raycaster, true)

  gizmoControlComponent.axis.set(intersect?.object?.name ?? null)
}

function pointerDown(gizmoEntity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointer = getComponent(inputPointerEntity, InputPointerComponent)
  const gizmoControlComponent = getMutableComponent(gizmoEntity, CameraGizmoControlComponent)
  const targetEntity = gizmoControlComponent.controlledCameras.get(NO_PROXY)[0]

  if (targetEntity === UndefinedEntity || pointer.movement.length() !== 0) return
}

/*function pointerMove(gizmoEntity) {
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
  const entity = targetEntity
  const plane = getComponent(gizmoControlComponent.planeEntity.value, GroupComponent)[0]

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
    pointer.movement.length() === 0
  )
    return

  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointer.position, camera)

  const planeIntersect = intersectObjectWithRay(plane, _raycaster, true)

  if (!planeIntersect) return
  gizmoControlComponent.pointEnd.set(planeIntersect.point.sub(gizmoControlComponent.worldPositionStart.value))


}*/

export function onGizmoCommit(gizmoEntity) {}

function pointerUp(gizmoEntity) {
  // TODO support gizmos in multiple viewports
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointer = getComponent(inputPointerEntity, InputPointerComponent)

  if (pointer.movement.length() !== 0) return
  onGizmoCommit(gizmoEntity)
}

export function onPointerHover(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, CameraGizmoControlComponent)

  if (gizmoControl === undefined) return
  if (!gizmoControl.enabled) return
  pointerHover(gizmoEntity)
}

export function onPointerDown(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, CameraGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  pointerHover(gizmoEntity)
  pointerDown(gizmoEntity)
}

/*export function onPointerMove(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  pointerMove(gizmoEntity)
}*/

export function onPointerUp(gizmoEntity) {
  const gizmoControl = getOptionalComponent(gizmoEntity, CameraGizmoControlComponent)
  if (gizmoControl === undefined) return

  if (!gizmoControl.enabled) return

  pointerUp(gizmoEntity)
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

export function onPointerLost(gizmoEntity: Entity) {
  setComponent(gizmoEntity, CameraGizmoControlComponent, { axis: null })
}
