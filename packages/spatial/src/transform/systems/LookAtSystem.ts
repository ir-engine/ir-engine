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

import { Engine, Entity, UUIDComponent, defineQuery, defineSystem, getComponent } from '@etherealengine/ecs'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { LookAtComponent } from '../components/LookAtComponent'
import { TransformComponent } from '../components/TransformComponent'
import { TransformSystem } from './TransformSystem'

const facerQuery = defineQuery([LookAtComponent, TransformComponent])
const srcPosition = new Vector3()
const dstPosition = new Vector3()
const direction = new Vector3()
const zero = new Vector3()
const up = new Vector3(0, 1, 0)
const lookMatrix = new Matrix4()
const lookRotation = new Quaternion()

export const LookAtSystem = defineSystem({
  uuid: 'ir.spatial.LookAtSystem',
  insert: { before: TransformSystem },
  execute: () => {
    const viewerEntity = Engine.instance.viewerEntity
    for (const entity of facerQuery()) {
      const facer = getComponent(entity, LookAtComponent)
      const targetEntity: Entity | null = facer.target ? UUIDComponent.getEntityByUUID(facer.target) : viewerEntity
      if (!targetEntity) continue
      TransformComponent.getWorldPosition(entity, srcPosition)
      TransformComponent.getWorldPosition(targetEntity, dstPosition)
      direction.subVectors(dstPosition, srcPosition).normalize()
      // look at target about enabled axes
      if (!facer.xAxis) {
        direction.y = 0
      }
      if (!facer.yAxis) {
        direction.x = 0
      }
      lookMatrix.lookAt(zero, direction, up)
      lookRotation.setFromRotationMatrix(lookMatrix)
      TransformComponent.setWorldRotation(entity, lookRotation)
      TransformComponent.updateFromWorldMatrix(entity)
    }
  }
})
