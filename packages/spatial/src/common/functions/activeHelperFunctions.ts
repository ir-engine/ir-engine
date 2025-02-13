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

import { Engine, Entity, getComponent, getMutableComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { Line, Object3D, Raycaster } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { InputPointerComponent } from '../../input/components/InputPointerComponent'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { TransformComponent } from '../../SpatialModule'
import { ActiveHelperComponent } from '../ActiveHelperComponent'
import { NameComponent } from '../NameComponent'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.NodeHelper)
_raycaster.firstHitOnly = true

const _interpolationFactor = 0.3

export function intersectObjectWithRay(object: Object3D, raycaster: Raycaster, includeInvisible?: boolean) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}

export function gizmoIconHelperYUpdate(helperEntity, position) {
  const transform = getComponent(helperEntity, TransformComponent)
  transform.position.set(position.x, 0, position.z)
  if (getComponent(helperEntity, MeshComponent) instanceof Line) transform.scale.set(1e-10, position.y, 1e-10)
  else transform.scale.set(4, 4, 4)
}

export function gizmoIconHelperUpdate(helperEntity, start, end) {
  const name = getComponent(helperEntity, NameComponent)
  const transform = getComponent(helperEntity, TransformComponent)
  if (name === 'DELTAX') {
    transform.position.set(start.x, 0, start.z)
    transform.scale.set(end.x - start.x, 1e-10, 1e-10)
  } else if (name === 'DELTAY') {
    gizmoIconHelperYUpdate(helperEntity, end)
  } else if (name === 'DELTAZ') {
    transform.position.set(end.x, 0, start.z)
    transform.scale.set(1e-10, 1e-10, end.z - start.z)
  }
}

export function gizmoIconUpdate(parentEntity: Entity) {
  const activeHelperComponent = getComponent(parentEntity, ActiveHelperComponent)
  const transform = getComponent(activeHelperComponent.helperDefaultGizmo, TransformComponent)
  const size = transform.scale
  const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)

  const factor = (camera as any).isOrthographicCamera
    ? ((camera as any).top - (camera as any).bottom) / camera.zoom
    : transform.position.distanceTo(camera.position) *
      Math.min((1.9 * Math.tan((Math.PI * camera.fov) / 360)) / camera.zoom, 7)

  const finalSize = size.set(1, 1, 1).multiplyScalar(factor * size.z * activeHelperComponent.sizeFactor)
  setComponent(activeHelperComponent.helperDefaultGizmo, TransformComponent, { scale: finalSize })
  for (const entity of activeHelperComponent.directionalEntities) {
    setComponent(entity, TransformComponent, { scale: finalSize })
  }
}

function pointerHover(parentEntity: Entity) {
  const activeHelperComponent = getMutableComponent(parentEntity, ActiveHelperComponent)
  const spriteObject = getComponent(activeHelperComponent.helperDefaultGizmo.value, ObjectComponent)
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointerPosition = getComponent(inputPointerEntity, InputPointerComponent).position
  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointerPosition, camera)

  const intersect = intersectObjectWithRay(spriteObject, _raycaster, true)
  const targetSize = intersect ? 0.25 : 0.2 // 0.3 is the hover size, 0.25 is the default size
  const originalSize = activeHelperComponent.sizeFactor.value
  const interpolatedSize = originalSize + (targetSize - originalSize) * _interpolationFactor
  activeHelperComponent.sizeFactor.set(interpolatedSize)

  return intersect
}

export function onPointerHover(entity) {
  const activeHelperComponent = getComponent(entity, ActiveHelperComponent)
  const spriteObject = getOptionalComponent(activeHelperComponent.helperDefaultGizmo, ObjectComponent)
  if (spriteObject === undefined) return

  return pointerHover(entity)
}
