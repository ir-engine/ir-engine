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

import { Quaternion, Raycaster, Vector3 } from 'three'

import {
  Entity,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { TransformAxis } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getState, NO_PROXY } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'

import { TransformComponent } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { Vector3_Forward } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraGizmoControlComponent } from '../classes/gizmo/camera/CameraGizmoControlComponent'
import { CameraGizmoVisualComponent } from '../classes/gizmo/camera/CameraGizmoVisualComponent'
import { cameraGizmo, GizmoMaterial, gizmoMaterialProperties } from '../constants/GizmoPresets'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.TransformGizmo) // this needs to be gizmo layer, but it doesnt work when its set to gizmo layer, investugate why

export function gizmoUpdate(gizmoEntity) {
  const gizmoControl = getComponent(gizmoEntity, CameraGizmoControlComponent)
  if (gizmoControl === undefined) return

  const gizmo = getComponent(gizmoControl.visualEntity, CameraGizmoVisualComponent)
  if (gizmo === undefined) return

  if (gizmo.gizmo === UndefinedEntity) return

  for (const handle of getComponent(gizmo.gizmo, GroupComponent)[0].children as any[]) {
    handle.visible = true
    handle.rotation.set(0, 0, 0)
    handle.position.set(0, 0, 0)

    // Hide disabled axes
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.X) === -1 ||
        handle.name.indexOf(TransformAxis.Xn) === -1 ||
        gizmoControl.showX)
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.Y) === -1 ||
        handle.name.indexOf(TransformAxis.Yn) === -1 ||
        gizmoControl.showY)
    handle.visible =
      handle.visible &&
      (handle.name.indexOf(TransformAxis.Z) === -1 ||
        handle.name.indexOf(TransformAxis.Zn) === -1 ||
        gizmoControl.showZ)

    // highlight selected axis

    //handle.material._color = handle.material._color || handle.material.uniforms.color.value
    handle.material._color = handle.material._color || handle.material.color.clone()
    handle.material._opacity = handle.material._opacity || handle.material.opacity

    //setGizmogizmoMaterialProperties(handle.material , handle.material._color , handle.material._opacity, true)

    handle.material.color.copy(handle.material._color)
    handle.material.opacity = handle.material._opacity

    if (!gizmoControl.enabled || !gizmoControl.axis || handle.name !== gizmoControl.axis) continue

    //setGizmoMaterial(handle, GizmoMaterial.YELLOW)
    handle.material.color.set(gizmoMaterialProperties[GizmoMaterial.YELLOW].color)
    handle.material.opacity = gizmoMaterialProperties[GizmoMaterial.YELLOW].opacity
  }
}

export function controlUpdate(gizmoEntity) {
  const gizmoVisualEntity = getComponent(gizmoEntity, CameraGizmoControlComponent).visualEntity
  const sceneCameraRot = getComponent(getState(EngineState).viewerEntity, TransformComponent).rotation // from center of focused object
  const sceneEntity = getComponent(gizmoVisualEntity, CameraGizmoVisualComponent).sceneEntity
  setComponent(sceneEntity, TransformComponent, {
    rotation: sceneCameraRot
  })
}

function pointerHover(gizmoEntity) {
  const gizmoControlComponent = getMutableComponent(gizmoEntity, CameraGizmoControlComponent)
  const panelInputPointerEntity = InputPointerComponent.getPointersForCamera(gizmoControlComponent.panelCamera.value)[0]
  if (!panelInputPointerEntity) return
  const pointerPosition = getComponent(panelInputPointerEntity, InputPointerComponent).position
  const gizmoVisual = getComponent(gizmoControlComponent.visualEntity.value, CameraGizmoVisualComponent)
  const picker = getComponent(gizmoVisual.picker, GroupComponent)[0]
  const targetEntity = gizmoControlComponent.panelCamera.get(NO_PROXY)

  if (targetEntity === UndefinedEntity) return

  const camera = getComponent(gizmoControlComponent.panelCamera.value, CameraComponent)
  _raycaster.setFromCamera(pointerPosition, camera)
  const intersect = intersectObjectWithRay(picker, _raycaster, true)

  gizmoControlComponent.axis.set(intersect?.object?.name ?? null)
}

function pointerDown(gizmoEntity) {
  const gizmoControl = getComponent(gizmoEntity, CameraGizmoControlComponent)
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(gizmoControl.panelCamera)[0]
  if (!inputPointerEntity) return

  const focusCenter = getComponent(getState(EngineState).viewerEntity, CameraOrbitComponent).cameraOrbitCenter.clone()
  const cameraDistance = focusCenter.distanceTo(
    getComponent(getState(EngineState).viewerEntity, TransformComponent).position
  )
  const axis = gizmoControl.axis
  const direction = new Vector3().fromArray(cameraGizmo[axis!][0][1]).normalize()
  const newRotation = new Quaternion().setFromUnitVectors(Vector3_Forward, direction.normalize())
  const newPosition = focusCenter.clone().add(direction.multiplyScalar(-cameraDistance))

  setComponent(getState(EngineState).viewerEntity, TransformComponent, { position: newPosition, rotation: newRotation })
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
  const gizmoControl = getComponent(gizmoEntity, CameraGizmoControlComponent)
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(gizmoControl.panelCamera)[0]
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
