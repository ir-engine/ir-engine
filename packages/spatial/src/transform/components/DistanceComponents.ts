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

import { Types } from 'bitecs'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

export const DistanceComponentSchema = { squaredDistance: Types.f32 }

export const DistanceFromLocalClientComponent = defineComponent({
  name: 'DistanceFromLocalClientComponent',
  schema: DistanceComponentSchema
})
export const DistanceFromCameraComponent = defineComponent({
  name: 'DistanceFromCameraComponent',
  schema: DistanceComponentSchema
})

export const FrustumCullCameraSchema = { isCulled: Types.ui8 }
export const FrustumCullCameraComponent = defineComponent({
  name: 'FrustumCullCameraComponent',
  schema: FrustumCullCameraSchema,

  onRemove(entity, component) {
    // reset upon removing the component
    FrustumCullCameraComponent.isCulled[entity] = 0
  }
})

export const compareDistanceToCamera = (a: Entity, b: Entity) => {
  const aDist = DistanceFromCameraComponent.squaredDistance[a]
  const bDist = DistanceFromCameraComponent.squaredDistance[b]
  return aDist - bDist
}

export const compareDistanceToLocalClient = (a: Entity, b: Entity) => {
  const aDist = DistanceFromLocalClientComponent.squaredDistance[a]
  const bDist = DistanceFromLocalClientComponent.squaredDistance[b]
  return aDist - bDist
}
