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

import { Entity, UUIDComponent, defineQuery, defineSystem, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { EngineState } from '../../EngineState'
import { Vector3_Up, Vector3_Zero } from '../../common/constants/MathConstants'
import { LookAtComponent } from '../components/LookAtComponent'
import { TransformComponent } from '../components/TransformComponent'
import { TransformDirtyUpdateSystem } from './TransformSystem'

const facerQuery = defineQuery([LookAtComponent, TransformComponent])
const _srcPosition = new Vector3()
const _dstPosition = new Vector3()
const _direction = new Vector3()
const _zero = Vector3_Zero.clone()
const _up = Vector3_Up.clone()
const _lookMatrix = new Matrix4()
const _lookRotation = new Quaternion()

export const LookAtSystem = defineSystem({
  uuid: 'ir.spatial.LookAtSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute: () => {
    const viewerEntity = getState(EngineState).viewerEntity
    if (!viewerEntity) return

    for (const entity of facerQuery()) {
      const facer = getComponent(entity, LookAtComponent)
      const targetEntity: Entity | null = facer.target ? UUIDComponent.getEntityByUUID(facer.target) : viewerEntity
      if (!targetEntity) continue
      TransformComponent.getWorldPosition(entity, _srcPosition)
      TransformComponent.getWorldPosition(targetEntity, _dstPosition)
      _direction.subVectors(_dstPosition, _srcPosition).normalize()
      // look at target about enabled axes
      if (!facer.xAxis) {
        _direction.y = 0
      }
      if (!facer.yAxis) {
        _direction.x = 0
      }
      _lookMatrix.lookAt(_zero, _direction, _up)
      _lookRotation.setFromRotationMatrix(_lookMatrix)
      TransformComponent.setWorldRotation(entity, _lookRotation)
      TransformComponent.updateFromWorldMatrix(entity)
    }
  }
})
