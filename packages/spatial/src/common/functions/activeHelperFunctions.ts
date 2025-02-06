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

import { Engine, Entity, getComponent, getOptionalComponent, removeComponent, setComponent } from '@ir-engine/ecs'
import { Object3D, Raycaster } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { InputPointerComponent } from '../../input/components/InputPointerComponent'
import { AnimateScaleComponent } from '../../renderer/components/AnimateScaleComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.NodeHelper)
_raycaster.firstHitOnly = true

export function intersectObjectWithRay(object: Object3D, raycaster: Raycaster, includeInvisible?: boolean) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}

function pointerHover(helperEntity: Entity) {
  const spriteObject = getComponent(helperEntity, ObjectComponent)
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointerPosition = getComponent(inputPointerEntity, InputPointerComponent).position
  const camera = getComponent(Engine.instance?.cameraEntity, CameraComponent)
  _raycaster.setFromCamera(pointerPosition, camera)

  const intersect = intersectObjectWithRay(spriteObject, _raycaster, true)

  if (intersect) {
    setComponent(helperEntity, AnimateScaleComponent, { multiplier: 1.1, duration: 250 })
  } else {
    removeComponent(helperEntity, AnimateScaleComponent)
  }
}

export function onPointerHover(helperEntity) {
  const spriteObject = getOptionalComponent(helperEntity, ObjectComponent)
  if (spriteObject === undefined) return

  pointerHover(helperEntity)
}
