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
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { ActiveHelperComponent } from '@ir-engine/spatial/src/common/ActiveHelperComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformComponent } from '@ir-engine/spatial/src/SpatialModule'
import { Line, Raycaster, Sprite, SpriteMaterial, TextureLoader } from 'three'
import { getCameraFactor, intersectObjectWithRay } from './gizmoCommonFunctions'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.NodeHelper)
_raycaster.firstHitOnly = true

const _interpolationFactor = 0.3 // used for the hover grow effect

export const createIconGizmo = (textureURL) => {
  const texture = new TextureLoader().load(textureURL)
  const material = new SpriteMaterial({
    map: texture,
    transparent: true, // Allow transparency
    opacity: 1
  })
  material.depthTest = false // Disable depth testing
  return new Sprite(material)
}

export function gizmoIconHelperYAxisUpdate(helperEntity, position) {
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
    gizmoIconHelperYAxisUpdate(helperEntity, end)
  } else if (name === 'DELTAZ') {
    transform.position.set(end.x, 0, start.z)
    transform.scale.set(1e-10, 1e-10, end.z - start.z)
  }
}

export function gizmoIconUpdate(parentEntity: Entity) {
  const activeHelperComponent = getComponent(parentEntity, ActiveHelperComponent)
  const transform = getComponent(activeHelperComponent.helperDefaultGizmo, TransformComponent)
  const size = transform.scale
  const finalSize = size.set(1, 1, 1).multiplyScalar(getCameraFactor(transform.position, size.z))
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
  const targetSize = intersect ? 0.25 : 0.2 // 0.25 is the hover size, 0.2 is the default size
  //TODO : make the sizeFactor editable
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
