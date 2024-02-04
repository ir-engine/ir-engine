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
