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

import { Engine, Entity, getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformComponent } from '@ir-engine/spatial/src/SpatialModule'
import { Line, Raycaster, Sprite, SpriteMaterial, TextureLoader } from 'three'
import { Vector3_One, Vector3_Zero } from '../../../../spatial/src/common/constants/MathConstants'
import { EditorHelperState } from '../../services/EditorHelperState'
import { getCameraFactor, intersectObjectWithRay } from './gizmoCommonFunctions'

const _raycaster = new Raycaster() // for hover
_raycaster.layers.set(ObjectLayers.NodeIcon)
_raycaster.firstHitOnly = true

const _interpolationFactor = 0.3 // used for the hover grow effect

export const VolumeVisibility = {
  Off: 'Off' as const,
  Auto: 'Auto' as const,
  On: 'On' as const
}

export const getIconGizmo = (textureURL) => {
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

export function gizmoIconUpdate(parentEntity: Entity, iconEntity: Entity, directionalEntities: Entity[], currentsize) {
  const transform = getComponent(iconEntity, TransformComponent)
  const parentTransform = getComponent(parentEntity, TransformComponent)
  const size = transform.scale
  const finalSize = size
    .set(1, 1, 1)
    .multiplyScalar(getCameraFactor(parentTransform.position, currentsize))
    .max(Vector3_One)
    .divide(parentTransform.scale)

  setComponent(iconEntity, TransformComponent, { position: Vector3_Zero, scale: finalSize })
  for (const entity of directionalEntities) {
    setComponent(entity, TransformComponent, { scale: finalSize })
  }
}

function pointerHover(studioIcon: Entity) {
  const spriteObject = getComponent(studioIcon, ObjectComponent)
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return

  const pointerPosition = getComponent(inputPointerEntity, InputPointerComponent).position
  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointerPosition, camera)

  const intersect = intersectObjectWithRay(spriteObject, _raycaster, true)
  return intersect
}

export function setIconSize(intersect, currentSize) {
  const targetSize = intersect
    ? getState(EditorHelperState).editorIconMaxSize
    : getState(EditorHelperState).editorIconMinSize
  //TODO : make the sizeFactor editable
  const originalSize = currentSize
  const interpolatedSize = originalSize + (targetSize - originalSize) * _interpolationFactor
  return interpolatedSize
}

export function onPointerHover(studioIcon) {
  const spriteObject = getOptionalComponent(studioIcon, ObjectComponent)
  if (spriteObject === undefined) return

  return pointerHover(studioIcon)
}
