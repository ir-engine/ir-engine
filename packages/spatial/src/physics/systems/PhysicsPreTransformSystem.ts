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

import { Entity, defineQuery, defineSystem, getComponent } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { getState } from '@etherealengine/hyperflux'
import { Not } from 'bitecs'
import { TransformComponent, TransformSystem } from '../../SpatialModule'
import { copyTransformToRigidBody, lerpTransformFromRigidbody } from '../../transform/functions/TransformFunctions'
import { isDirty } from '../../transform/systems/TransformSystem'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyFixedTagComponent
} from '../components/RigidBodyComponent'

const rigidbodyQuery = defineQuery([TransformComponent, RigidBodyComponent])
const kinematicRigidbodyQuery = defineQuery([
  TransformComponent,
  RigidBodyComponent,
  Not(RigidBodyFixedTagComponent),
  Not(RigidBodyDynamicTagComponent)
])

const filterAwakeCleanRigidbodies = (entity: Entity) =>
  !getComponent(entity, RigidBodyComponent).body?.isSleeping() && !isDirty(entity)

export const execute = () => {
  const ecsState = getState(ECSState)

  /**
   * Update entity transforms
   */
  const allRigidbodyEntities = rigidbodyQuery()
  const kinematicRigidbodyEntities = kinematicRigidbodyQuery()
  const awakeCleanRigidbodyEntities = allRigidbodyEntities.filter(filterAwakeCleanRigidbodies)
  const dirtyKinematicRigidbodyEntities = kinematicRigidbodyEntities.filter(isDirty)
  // const dirtyRigidbodyEntities = allRigidbodyEntities.filter(isDirty)

  // if rigidbody transforms have been dirtied, teleport the rigidbody to the transform
  for (const entity of dirtyKinematicRigidbodyEntities) copyTransformToRigidBody(entity)

  // lerp awake clean rigidbody entities (and make their transforms dirty)
  const simulationRemainder = ecsState.frameTime - ecsState.simulationTime
  const alpha = Math.min(simulationRemainder / ecsState.simulationTimestep, 1)
  for (const entity of awakeCleanRigidbodyEntities) lerpTransformFromRigidbody(entity, alpha)
}

export const PhysicsPreTransformSystem = defineSystem({
  uuid: 'ee.engine.PhysicsPreTransformSystem',
  insert: { before: TransformSystem },
  execute
})
